import { SearchResponse, SearchResult, UserRole } from '@/types/index.js';
import { logger } from '../utils/logger';
import { elasticsearchService } from './elasticsearch';

interface HybridSearchParams {
  query: string;
  userRole: UserRole;
  filters?: any;
  indices?: string[];
  size?: number;
  from?: number;
  searchType?: 'hybrid' | 'semantic' | 'keyword';
}

interface SearchAggregations {
  types: any;
  sources: any;
  categories: any;
  timeRange: any;
}

export class HybridSearchEngine {
  private defaultIndices = ['patients', 'clinical-notes', 'lab-results', 'medications', 'research-papers'];
  private maxResults = 50;
  private defaultSize = 10;

  async search(params: HybridSearchParams): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Hybrid search called with params:', JSON.stringify(params, null, 2));
      
      // Build search query based on type
      const searchBody = await this.buildSearchQuery(params);
      console.log('🔍 Built search body:', JSON.stringify(searchBody, null, 2));
      
      // Execute search
      const searchParams = {
        index: params.indices || this.defaultIndices,
        body: searchBody,
        size: Math.min(params.size || this.defaultSize, this.maxResults),
        from: params.from || 0,
      };
      
      console.log('🔍 Search params:', JSON.stringify(searchParams, null, 2));
      
      const esResponse = await elasticsearchService.search(searchParams);

      console.log('🔍 Elasticsearch response hits:', esResponse.hits.total.value);
      console.log('🔍 Elasticsearch response sample hits:', JSON.stringify(esResponse.hits.hits.slice(0, 2), null, 2));

      // Process and format results
      const results = this.processSearchResults(esResponse.hits.hits, params.userRole);
      const aggregations = this.processAggregations(esResponse.aggregations);
      const suggestions = await this.generateSuggestions(params.query, params.userRole);
      const conversationalResponse = this.generateConversationalResponse(
        params.query, 
        results, 
        params.userRole
      );

      const queryTime = Date.now() - startTime;

      return {
        results,
        totalResults: esResponse.hits.total.value,
        queryTime,
        suggestions,
        conversationalResponse,
        aggregations,
        pagination: {
          offset: params.from || 0,
          limit: params.size || this.defaultSize,
          hasMore: (params.from || 0) + results.length < esResponse.hits.total.value
        }
      };

    } catch (error) {
      logger.error('Hybrid search failed:', error);
      throw new Error(`Search failed: ${(error as Error).message}`);
    }
  }

  private async buildSearchQuery(params: HybridSearchParams): Promise<any> {
    const { query, searchType = 'hybrid', filters, userRole } = params;

    // Base query structure
    const searchBody: any = {
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: []
        }
      },
      highlight: {
        fields: {
          'searchable_text': { fragment_size: 150, number_of_fragments: 1 },
          'text': { fragment_size: 200, number_of_fragments: 2 },
          'title': { fragment_size: 150, number_of_fragments: 1 }
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>']
      },
      aggs: this.buildAggregations(),
      _source: {
        excludes: ['embedding'] // Exclude large fields unless needed
      }
    };

    // Build main query based on search type
    if (searchType === 'hybrid') {
      await this.addHybridQuery(searchBody, query);
    } else if (searchType === 'semantic') {
      await this.addSemanticQuery(searchBody, query);
    } else {
      this.addKeywordQuery(searchBody, query);
    }

    // Apply filters if provided
    if (filters) {
      this.applyFilters(searchBody, filters);
    }

    // Add role-based filtering
    this.applyRoleBasedFiltering(searchBody, userRole);

    // Add boost for relevance
    this.addRelevanceBoosts(searchBody, userRole);

    return searchBody;
  }

  private async addHybridQuery(searchBody: any, query: string): Promise<void> {
    // Multi-match query for lexical search (BM25)
    const lexicalQuery = {
      multi_match: {
        query: query,
        fields: [
          'searchable_text^3',
          'text^2',
          'conditions.description^1.5',
          'demographics.gender^1.2',
          'category^1.5',
          'label^1.5',
          'title^2'
        ],
        type: 'best_fields',
        fuzziness: 'AUTO',
        operator: 'or',
        minimum_should_match: '75%'
      }
    };

    searchBody.query.bool.must.push(lexicalQuery);

    // Add semantic search if embeddings are available
    try {
      const embedding = await this.generateQueryEmbedding(query);
      if (embedding) {
        searchBody.knn = {
          field: 'embedding',
          query_vector: embedding,
          k: 50,
          num_candidates: 100,
          boost: 0.3
        };

        // Use RRF to combine lexical and semantic results
        searchBody.rank = {
          rrf: {
            window_size: 100,
            rank_constant: 20
          }
        };
      }
    } catch (error) {
      logger.warn('Semantic search not available, using lexical only:', error);
    }
  }

  private async addSemanticQuery(searchBody: any, query: string): Promise<void> {
    try {
      const embedding = await this.generateQueryEmbedding(query);
      if (embedding) {
        searchBody.knn = {
          field: 'embedding',
          query_vector: embedding,
          k: 50,
          num_candidates: 200
        };
      } else {
        // Fallback to lexical if no embeddings
        this.addKeywordQuery(searchBody, query);
      }
    } catch (error) {
      logger.error('Semantic search failed, falling back to keyword:', error);
      this.addKeywordQuery(searchBody, query);
    }
  }

  private addKeywordQuery(searchBody: any, query: string): void {
    const keywordQuery = {
      bool: {
        should: [
          {
            multi_match: {
              query: query,
              fields: ['searchable_text^3', 'text^2', 'category^1.5', 'label^1.5', 'title^2'],
              type: 'phrase',
              boost: 2.0
            }
          },
          {
            multi_match: {
              query: query,
              fields: ['searchable_text^2', 'text', 'category', 'label', 'title'],
              type: 'cross_fields',
              operator: 'and'
            }
          },
          {
            wildcard: {
              'searchable_text': {
                value: `*${query.toLowerCase()}*`,
                boost: 1.5
              }
            }
          }
        ],
        minimum_should_match: 1
      }
    };

    searchBody.query.bool.must.push(keywordQuery);
  }

  private applyFilters(searchBody: any, filters: any): void {
    if (!filters) return;

    // Date range filter
    if (filters.dateRange) {
      searchBody.query.bool.filter.push({
        range: {
          timestamp: {
            gte: filters.dateRange.start,
            lte: filters.dateRange.end
          }
        }
      });
    }

    // Result type filter
    if (filters.resultTypes && filters.resultTypes.length > 0) {
      searchBody.query.bool.filter.push({
        terms: {
          'type.keyword': filters.resultTypes
        }
      });
    }

    // Medical codes filter
    if (filters.medicalCodes && filters.medicalCodes.length > 0) {
      searchBody.query.bool.should.push({
        terms: {
          'conditions.icd10_code.keyword': filters.medicalCodes
        }
      });
    }

    // Patient demographics filter
    if (filters.patientDemographics) {
      const demo = filters.patientDemographics;
      
      if (demo.ageRange) {
        searchBody.query.bool.filter.push({
          range: {
            'demographics.age': {
              gte: demo.ageRange[0],
              lte: demo.ageRange[1]
            }
          }
        });
      }

      if (demo.gender) {
        searchBody.query.bool.filter.push({
          term: {
            'demographics.gender.keyword': demo.gender
          }
        });
      }
    }

    // Department filter
    if (filters.departments && filters.departments.length > 0) {
      searchBody.query.bool.filter.push({
        terms: {
          'department.keyword': filters.departments
        }
      });
    }
  }

  private applyRoleBasedFiltering(searchBody: any, userRole: UserRole): void {
    if (userRole === 'patient') {
      // Patients should see limited clinical details
      searchBody.query.bool.must_not.push({
        exists: {
          field: 'internal_notes'
        }
      });

      // Boost patient-friendly content
      searchBody.query.bool.should.push({
        term: {
          'patient_friendly': {
            value: true,
            boost: 2.0
          }
        }
      });
    } else if (userRole === 'clinician') {
      // Clinicians get full access and prefer technical content
      searchBody.query.bool.should.push({
        term: {
          'clinical_relevance': {
            value: 'high',
            boost: 1.5
          }
        }
      });
    }
  }

  private addRelevanceBoosts(searchBody: any, userRole: UserRole): void {
    // Time-based boost (more recent is better)
    searchBody.query.bool.should.push({
      function_score: {
        functions: [
          {
            gauss: {
              timestamp: {
                origin: 'now',
                scale: '30d',
                decay: 0.5
              }
            }
          }
        ],
        boost_mode: 'multiply',
        score_mode: 'sum'
      }
    });

    // Type-based boosts
    const typeBoosts = userRole === 'clinician' ? {
      'clinical-note': 1.2,
      'lab-result': 1.1,
      'research': 1.3
    } : {
      'patient': 1.5,
      'medication': 1.2,
      'lab-result': 1.1
    };

    for (const [type, boost] of Object.entries(typeBoosts)) {
      searchBody.query.bool.should.push({
        term: {
          'type.keyword': {
            value: type,
            boost: boost
          }
        }
      });
    }
  }

  private buildAggregations(): any {
    return {
      types: {
        terms: {
          field: 'type.keyword',
          size: 10
        }
      },
      sources: {
        terms: {
          field: 'source.keyword',
          size: 10
        }
      },
      categories: {
        terms: {
          field: 'category.keyword',
          size: 15
        }
      },
      timeRange: {
        date_histogram: {
          field: 'timestamp',
          calendar_interval: 'month',
          format: 'yyyy-MM'
        }
      },
      severity: {
        terms: {
          field: 'severity.keyword',
          size: 5
        }
      }
    };
  }

  private processSearchResults(hits: any[], userRole: UserRole): SearchResult[] {
    return hits.map((hit, index) => {
      const source = hit._source;
      const highlights = hit.highlight || {};
      
      // Determine document type based on available fields
      let type = 'record';
      if (source.patient_id && source.conditions) {
        type = 'patient';
      } else if (source.note_id && source.text) {
        type = 'clinical-note';
      } else if (source.label) {
        type = 'lab-result';
      } else if (source.drug) {
        type = 'medication';
      } else if (source.title && source.abstract) {
        type = 'research';
      }
      
      // Generate title based on document type
      let title = '';
      if (type === 'patient') {
        title = `Patient ${source.patient_id}: ${source.demographics?.gender || 'Unknown'}, Age ${source.age || 'Unknown'}`;
      } else if (type === 'clinical-note') {
        title = `${source.category || 'Clinical Note'} for Patient ${source.patient_id}`;
      } else if (type === 'lab-result') {
        title = `Lab Result: ${source.label || 'Unknown Test'}`;
      } else if (type === 'medication') {
        title = `Medication: ${source.drug || 'Prescribed Drug'}`;
      } else if (type === 'research') {
        title = source.title || 'Research Paper';
      } else {
        title = 'Medical Record';
      }
      
      // Generate summary based on document type
      let summary = '';
      if (type === 'patient') {
        const conditions = source.conditions?.map((c: any) => c.description).join(', ') || 'No conditions listed';
        summary = `${source.demographics?.gender || 'Patient'} with ${conditions}`;
      } else if (type === 'clinical-note') {
        summary = source.text?.substring(0, 200) + '...' || 'Clinical note content';
      } else if (type === 'lab-result') {
        summary = `${source.value || ''} ${source.units || ''} ${source.valueuom || ''}`;
      } else if (type === 'medication') {
        summary = `${source.dosage || ''} ${source.frequency || ''} ${source.route || ''}`;
      } else if (type === 'research') {
        summary = source.abstract?.substring(0, 200) + '...' || 'Research abstract';
      } else {
        summary = 'Medical record information';
      }
      
      return {
        id: hit._id || `result-${index}`,
        title: title,
        summary: summary,
        relevanceScore: hit._score || 0.5,
        source: source.source || 'MIMIC-III Database',
        type: type as any,
        highlights: this.extractHighlights(highlights),
        metadata: this.extractMetadata(source, userRole),
        timestamp: source.created_at || source.timestamp || new Date().toISOString()
      };
    });
  }

  private processSummaryForRole(summary: string, userRole: UserRole): string {
    if (userRole === 'patient') {
      // Simplify medical terminology for patients
      return this.simplifyMedicalTerms(summary);
    }
    return summary;
  }

  private simplifyMedicalTerms(text: string): string {
    const simplifications = {
      'myocardial infarction': 'heart attack',
      'hypertension': 'high blood pressure',
      'diabetes mellitus': 'diabetes',
      'pneumonia': 'lung infection',
      'chronic obstructive pulmonary disease': 'COPD (lung disease)',
      'cerebrovascular accident': 'stroke'
    };

    let simplified = text;
    for (const [medical, simple] of Object.entries(simplifications)) {
      simplified = simplified.replace(new RegExp(medical, 'gi'), simple);
    }

    return simplified;
  }

  private extractHighlights(highlights: any): string[] {
    const allHighlights: string[] = [];
    
    for (const field of Object.keys(highlights)) {
      allHighlights.push(...highlights[field]);
    }
    
    return allHighlights.slice(0, 5); // Limit to 5 highlights
  }

  private extractMetadata(source: any, userRole: UserRole): Record<string, any> {
    const baseMetadata = {
      type: source.type,
      source: source.source,
      timestamp: source.timestamp
    };

    // Add role-specific metadata
    if (userRole === 'clinician') {
      return {
        ...baseMetadata,
        patientId: source.patient_id,
        department: source.department,
        provider: source.author || source.ordering_provider,
        severity: source.severity,
        category: source.category
      };
    } else {
      return {
        ...baseMetadata,
        category: source.category,
        simplified: true
      };
    }
  }

  private processAggregations(aggregations: any): SearchAggregations | undefined {
    if (!aggregations) return undefined;

    return {
      types: aggregations.types?.buckets || [],
      sources: aggregations.sources?.buckets || [],
      categories: aggregations.categories?.buckets || [],
      timeRange: aggregations.timeRange?.buckets || []
    };
  }

  public async generateSuggestions(query: string, userRole: UserRole): Promise<string[]> {
    const baseSuggestions = userRole === 'clinician' ? [
      'diabetes management protocols',
      'hypertension treatment guidelines',
      'drug interaction checker',
      'clinical decision support',
      'evidence-based medicine',
      'patient risk assessment'
    ] : [
      'blood test results explained',
      'medication side effects',
      'healthy lifestyle tips',
      'symptom checker',
      'when to see doctor',
      'understanding diagnosis'
    ];

    // Filter suggestions based on query
    const filteredSuggestions = baseSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(suggestion.split(' ')[0])
    );

    return filteredSuggestions.length > 0 ? filteredSuggestions.slice(0, 4) : baseSuggestions.slice(0, 4);
  }

  private generateConversationalResponse(
    query: string, 
    results: SearchResult[], 
    userRole: UserRole
  ): string {
    const resultCount = results.length;
    
    if (resultCount === 0) {
      return userRole === 'clinician' 
        ? `I didn't find any clinical results for "${query}". Try refining your search terms or checking for spelling variations.`
        : `I couldn't find information about "${query}". You might want to ask your healthcare provider or try different search terms.`;
    }

    const responseIntro = userRole === 'clinician'
      ? `Found ${resultCount} clinical results for "${query}".`
      : `I found ${resultCount} results about "${query}".`;

    // Analyze result types
    const resultTypes = [...new Set(results.map(r => r.type))];
    const typeDescriptions = this.getTypeDescriptions(resultTypes, userRole);

    let response = responseIntro;
    
    if (typeDescriptions.length > 0) {
      response += ` The results include ${typeDescriptions.join(', ')}.`;
    }

    // Add role-specific guidance
    if (userRole === 'clinician') {
      response += ' Review the evidence levels and source citations to inform your clinical decision-making.';
    } else {
      response += ' Remember to discuss any health concerns with your healthcare provider.';
    }

    return response;
  }

  private getTypeDescriptions(types: string[], userRole: UserRole): string[] {
    const typeMap: Record<string, string> = userRole === 'clinician' ? {
      'patient': 'patient records',
      'clinical-note': 'clinical documentation',
      'lab-result': 'laboratory findings',
      'medication': 'pharmaceutical information',
      'research': 'medical literature'
    } : {
      'patient': 'patient information',
      'clinical-note': 'medical notes',
      'lab-result': 'test results',
      'medication': 'medication details',
      'research': 'medical research'
    };

    return types.map(type => typeMap[type] || type).filter(Boolean) as string[];
  }

  private async generateQueryEmbedding(query: string): Promise<number[] | null> {
    // Placeholder for embedding generation
    // In production, this would call a medical embedding model
    try {
      // This would integrate with a medical embedding service
      // For now, return null to indicate embeddings not available
      return null;
    } catch (error) {
      logger.warn('Failed to generate query embedding:', error);
      return null;
    }
  }

  async searchSimilarCases(
    patientId: string, 
    userRole: UserRole,
    similarityFields: string[] = ['conditions', 'demographics.age', 'demographics.gender']
  ): Promise<SearchResult[]> {
    try {
      // Get patient record
      const patient = await elasticsearchService.getDocument('patients', patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Build similarity query
      const searchBody: any = {
        query: {
          bool: {
            must: [
              {
                term: {
                  'type.keyword': 'patient'
                }
              }
            ],
            must_not: [
              {
                term: {
                  'id.keyword': patientId
                }
              }
            ],
            should: []
          }
        },
        size: 10
      };

      // Add similarity conditions
      const patientData = patient._source;
      
      if (similarityFields.includes('conditions') && patientData.conditions) {
        const conditionCodes = patientData.conditions.map((c: any) => c.icd10_code);
        searchBody.query.bool.should.push({
          terms: {
            'conditions.icd10_code.keyword': conditionCodes,
            boost: 3.0
          }
        });
      }

      if (similarityFields.includes('demographics.age') && patientData.demographics?.age) {
        const age = patientData.demographics.age;
        searchBody.query.bool.should.push({
          range: {
            'demographics.age': {
              gte: age - 10,
              lte: age + 10,
              boost: 1.5
            }
          }
        });
      }

      if (similarityFields.includes('demographics.gender') && patientData.demographics?.gender) {
        searchBody.query.bool.should.push({
          term: {
            'demographics.gender.keyword': {
              value: patientData.demographics.gender,
              boost: 1.2
            }
          }
        });
      }

      const response = await elasticsearchService.search({
        index: 'patients',
        body: searchBody
      });

      return this.processSearchResults(response.hits.hits, userRole);

    } catch (error) {
      logger.error('Similar cases search failed:', error);
      throw error;
    }
  }
}

export const hybridSearchEngine = new HybridSearchEngine();