import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';

// Elasticsearch configuration
const ELASTICSEARCH_CONFIG = {
  node: 'https://my-elasticsearch-project-b1c395.es.us-central1.gcp.elastic.cloud:443',
  auth: {
    apiKey: 'Yzlxa3Naa0JYMHEyN2RUZ2ptckg6TzB2dDNfc1ZxbVhlZEw5UFJNVFdiQQ=='
  },
  tls: {
    rejectUnauthorized: true
  }
};

// Index configurations
export const INDICES = {
  PATIENTS: 'patients',
  CLINICAL_NOTES: 'clinical-notes',
  LAB_RESULTS: 'lab-results',
  MEDICATIONS: 'medications',
  RESEARCH_PAPERS: 'research-papers',
  MEDICAL_RECORDS: 'medical-records',
  MEDICAL_CODES: 'medical-codes'
};

// Patient index mapping
const PATIENT_MAPPING: any = {
  properties: {
    patient_id: { type: 'keyword' },
    demographics: {
      properties: {
        name: { type: 'text', analyzer: 'standard' },
        date_of_birth: { type: 'date' },
        gender: { type: 'keyword' },
        race: { type: 'keyword' },
        ethnicity: { type: 'keyword' }
      }
    },
    conditions: {
      type: 'nested',
      properties: {
        icd9_code: { type: 'keyword' },
        icd10_code: { type: 'keyword' },
        description: { type: 'text', analyzer: 'standard' },
        diagnosis_time: { type: 'date' }
      }
    },
    age: { type: 'integer' },
    searchable_text: {
      type: 'text',
      analyzer: 'standard'
    },
    embedding: {
      type: 'dense_vector',
      dims: 384
    }
  }
};

// Clinical notes mapping
const CLINICAL_NOTES_MAPPING: any = {
  properties: {
    note_id: { type: 'keyword' },
    patient_id: { type: 'keyword' },
    chartdate: { type: 'date' },
    category: { type: 'keyword' },
    text: { type: 'text', analyzer: 'standard' },
    searchable_text: { type: 'text', analyzer: 'standard' },
    embedding: { type: 'dense_vector', dims: 384 }
  }
};

// Lab results mapping
const LAB_RESULTS_MAPPING: any = {
  properties: {
    lab_id: { type: 'keyword' },
    patient_id: { type: 'keyword' },
    itemid: { type: 'keyword' },
    charttime: { type: 'date' },
    value: { type: 'text' },
    valuenum: { type: 'float' },
    valueuom: { type: 'keyword' },
    label: { type: 'text', analyzer: 'standard' },
    searchable_text: { type: 'text', analyzer: 'standard' },
    embedding: { type: 'dense_vector', dims: 384 }
  }
};

// Medications mapping
const MEDICATIONS_MAPPING: any = {
  properties: {
    prescription_id: { type: 'keyword' },
    patient_id: { type: 'keyword' },
    drug: { type: 'text', analyzer: 'standard' },
    startdate: { type: 'date' },
    enddate: { type: 'date' },
    route: { type: 'keyword' },
    frequency: { type: 'keyword' },
    searchable_text: { type: 'text', analyzer: 'standard' },
    embedding: { type: 'dense_vector', dims: 384 }
  }
};

// Research papers mapping
const RESEARCH_PAPERS_MAPPING: any = {
  properties: {
    pmid: { type: 'keyword' },
    title: { type: 'text', analyzer: 'standard' },
    abstract: { type: 'text', analyzer: 'standard' },
    authors: { type: 'text' },
    journal: { type: 'keyword' },
    publication_date: { type: 'date' },
    searchable_text: { type: 'text', analyzer: 'standard' },
    embedding: { type: 'dense_vector', dims: 384 }
  }
};

// Medical codes mapping
const MEDICAL_CODES_MAPPING: any = {
  properties: {
    code: { type: 'keyword' },
    codeSystem: { type: 'keyword' },
    description: { type: 'text', analyzer: 'standard' },
    longDescription: { type: 'text', analyzer: 'standard' },
    category: { type: 'keyword' },
    parentId: { type: 'keyword' },
    children: { type: 'keyword' },
    searchable_text: { type: 'text', analyzer: 'standard' },
    embedding: { type: 'dense_vector', dims: 384 }
  }
};

class ElasticsearchService {
  private client: Client;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client(ELASTICSEARCH_CONFIG);
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      await this.testConnection();
      this.isConnected = true;
      logger.info('Elasticsearch connection established successfully');
      await this.initializeIndices();
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to Elasticsearch:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Elasticsearch ping failed:', error);
      throw error;
    }
  }

  async initializeIndices(): Promise<void> {
    const indexMappings = {
      [INDICES.PATIENTS]: PATIENT_MAPPING,
      [INDICES.CLINICAL_NOTES]: CLINICAL_NOTES_MAPPING,
      [INDICES.LAB_RESULTS]: LAB_RESULTS_MAPPING,
      [INDICES.MEDICATIONS]: MEDICATIONS_MAPPING,
      [INDICES.RESEARCH_PAPERS]: RESEARCH_PAPERS_MAPPING,
      [INDICES.MEDICAL_CODES]: MEDICAL_CODES_MAPPING
    };

    for (const [indexName, mapping] of Object.entries(indexMappings)) {
      try {
        const exists = await this.client.indices.exists({ index: indexName });
        if (!exists) {
          await this.client.indices.create({
            index: indexName,
            mappings: mapping
          });
          logger.info(`Created index: ${indexName}`);
        }
      } catch (error) {
        logger.error(`Failed to create index ${indexName}:`, error);
      }
    }
  }

  // Hybrid search implementation
  async hybridSearch({
    query,
    indices = [INDICES.PATIENTS, INDICES.CLINICAL_NOTES, INDICES.LAB_RESULTS, INDICES.MEDICATIONS, INDICES.RESEARCH_PAPERS],
    size = 10,
    userRole = 'patient'
  }: {
    query: string;
    indices?: string[];
    size?: number;
    userRole?: string;
  }): Promise<any> {
    try {
      const searchQuery = {
        bool: {
          should: [
            {
              multi_match: {
                query,
                fields: ['searchable_text^2', 'text^1.5', 'title^2', 'conditions.description^1.5', 'drug^1.5', 'label^1.5'],
                type: 'best_fields' as const,
                fuzziness: 'AUTO'
              }
            },
            {
              match_phrase: {
                searchable_text: {
                  query,
                  boost: 3
                }
              }
            }
          ]
        }
      };

      const results = await this.client.search({
        index: indices,
        query: searchQuery,
        size,
        highlight: {
          fields: {
            searchable_text: {},
            text: {},
            title: {}
          }
        }
      });

      return this.processSearchResults(results, userRole);
    } catch (error) {
      logger.error('Hybrid search failed:', error);
      throw error;
    }
  }

  private processSearchResults(results: any, userRole: string): any {
    return {
      hits: results.hits.hits.map((hit: any) => ({
        id: hit._id,
        index: hit._index,
        score: hit._score,
        source: hit._source,
        highlights: hit.highlight || {}
      })),
      total: results.hits.total,
      took: results.took
    };
  }

  // Bulk indexing
  async bulkIndex(operations: any[]): Promise<any> {
    try {
      const response = await this.client.bulk({
        refresh: true,
        operations
      });
      
      if (response.errors) {
        logger.warn(`Bulk indexing completed with errors`);
      } else {
        logger.info(`Successfully indexed ${response.items.length} documents`);
      }
      
      return response;
    } catch (error) {
      logger.error('Bulk indexing failed:', error);
      throw error;
    }
  }

  // Get document by ID
  async getDocument(index: string, id: string): Promise<any> {
    try {
      return await this.client.get({ index, id });
    } catch (error) {
      if ((error as any).statusCode === 404) return null;
      throw error;
    }
  }

  // Index single document
  async indexDocument(index: string, id: string, document: any): Promise<any> {
    return this.client.index({ index, id, document, refresh: true });
  }

  // Search method
  async search(params: any): Promise<any> {
    console.log('🔍 Elasticsearch search called with params:', JSON.stringify(params, null, 2));
    try {
      const result = await this.client.search(params);
      console.log('🔍 Elasticsearch search result:', result.hits.total);
      return result;
    } catch (error) {
      console.error('🔍 Elasticsearch search error:', error);
      throw error;
    }
  }

  // Health check
  async getHealth(): Promise<any> {
    try {
      // Use info API instead of cluster health for Elastic Cloud
      const info = await this.client.info();
      return {
        cluster: { status: 'available' },
        connected: this.isConnected,
        timestamp: new Date().toISOString(),
        info: info
      };
    } catch (error) {
      // Fallback if info API also fails
      return {
        cluster: { status: 'unavailable' },
        connected: this.isConnected,
        timestamp: new Date().toISOString(),
        error: (error as Error).message
      };
    }
  }
}

export const elasticsearchService = new ElasticsearchService();
export default elasticsearchService;