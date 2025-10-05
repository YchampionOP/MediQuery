import axios from 'axios';
import { logger } from '../utils/logger';

// PubMed API interfaces
export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  meshTerms: string[];
  keywords: string[];
  doi?: string;
  pii?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  language: string;
  publicationType: string[];
}

export interface PubMedSearchResult {
  articles: PubMedArticle[];
  totalResults: number;
  queryTranslation: string;
}

export interface PubMedSearchOptions {
  maxResults?: number;
  sort?: 'relevance' | 'pubDate' | 'author' | 'journal';
  filters?: {
    publicationDate?: {
      start?: string; // YYYY/MM/DD
      end?: string;   // YYYY/MM/DD
    };
    articleType?: string[];
    language?: string[];
    meshTerms?: string[];
  };
}

export class PubMedService {
  private readonly baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    logger.info('PubMed service initialized');
  }

  /**
   * Search PubMed for articles
   * @param query Search query
   * @param options Search options
   */
  async search(query: string, options: PubMedSearchOptions = {}): Promise<PubMedSearchResult> {
    try {
      const maxResults = options.maxResults || 20;
      const sort = options.sort || 'relevance';
      
      // Build search query with filters
      let searchQuery = query;
      
      if (options.filters) {
        if (options.filters.publicationDate?.start || options.filters.publicationDate?.end) {
          const startDate = options.filters.publicationDate.start || '1800/01/01';
          const endDate = options.filters.publicationDate.end || new Date().toISOString().split('T')[0].replace(/-/g, '/');
          searchQuery += ` AND (${startDate}[Date - Publication] : ${endDate}[Date - Publication])`;
        }
        
        if (options.filters.articleType && options.filters.articleType.length > 0) {
          const typeFilter = options.filters.articleType.map(type => `"${type}"[Publication Type]`).join(' OR ');
          searchQuery += ` AND (${typeFilter})`;
        }
        
        if (options.filters.language && options.filters.language.length > 0) {
          const langFilter = options.filters.language.map(lang => `"${lang}"[Language]`).join(' OR ');
          searchQuery += ` AND (${langFilter})`;
        }
        
        if (options.filters.meshTerms && options.filters.meshTerms.length > 0) {
          const meshFilter = options.filters.meshTerms.map(term => `"${term}"[MeSH Terms]`).join(' OR ');
          searchQuery += ` AND (${meshFilter})`;
        }
      }

      // Search for PMIDs
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: searchQuery,
        retmax: maxResults.toString(),
        sort: sort,
        retmode: 'json'
      });

      if (this.apiKey) {
        searchParams.append('api_key', this.apiKey);
      }

      const searchResponse = await axios.get(`${this.baseUrl}/esearch.fcgi`, {
        params: searchParams
      });

      const pmids = searchResponse.data.esearchresult.idlist;
      const queryTranslation = searchResponse.data.esearchresult.querytranslation;
      const totalResults = parseInt(searchResponse.data.esearchresult.count) || 0;

      if (!pmids || pmids.length === 0) {
        return {
          articles: [],
          totalResults,
          queryTranslation
        };
      }

      // Fetch article details
      const fetchParams = new URLSearchParams({
        db: 'pubmed',
        id: pmids.join(','),
        retmode: 'xml'
      });

      if (this.apiKey) {
        fetchParams.append('api_key', this.apiKey);
      }

      const fetchResponse = await axios.get(`${this.baseUrl}/efetch.fcgi`, {
        params: fetchParams
      });

      const articles = this.parseXMLResponse(fetchResponse.data);
      
      return {
        articles,
        totalResults,
        queryTranslation
      };

    } catch (error) {
      logger.error('PubMed search failed:', error);
      throw new Error(`Failed to search PubMed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific article by PMID
   * @param pmid PubMed ID
   */
  async getArticle(pmid: string): Promise<PubMedArticle | null> {
    try {
      const params = new URLSearchParams({
        db: 'pubmed',
        id: pmid,
        retmode: 'xml'
      });

      if (this.apiKey) {
        params.append('api_key', this.apiKey);
      }

      const response = await axios.get(`${this.baseUrl}/efetch.fcgi`, {
        params
      });

      const articles = this.parseXMLResponse(response.data);
      return articles.length > 0 ? articles[0] : null;

    } catch (error) {
      logger.error(`Failed to fetch PubMed article ${pmid}:`, error);
      return null;
    }
  }

  /**
   * Parse XML response from PubMed
   * @param xml XML response from PubMed
   */
  private parseXMLResponse(xml: string): PubMedArticle[] {
    try {
      // Simple XML parsing - in production, you'd use a proper XML parser
      const articles: PubMedArticle[] = [];
      
      // Extract articles using regex (simplified approach)
      const articleMatches = xml.match(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g) || [];
      
      for (const articleXml of articleMatches) {
        try {
          const pmid = this.extractTagContent(articleXml, 'PMID');
          const title = this.extractTagContent(articleXml, 'ArticleTitle');
          const abstract = this.extractTagContent(articleXml, 'AbstractText');
          const journal = this.extractTagContent(articleXml, 'Title', 'Journal');
          const pubDate = this.extractPublicationDate(articleXml);
          const language = this.extractTagContent(articleXml, 'Language') || 'eng';
          
          // Extract authors
          const authors: string[] = [];
          const authorMatches = articleXml.match(/<Author>([\s\S]*?)<\/Author>/g) || [];
          for (const authorXml of authorMatches) {
            const lastName = this.extractTagContent(authorXml, 'LastName');
            const foreName = this.extractTagContent(authorXml, 'ForeName');
            if (lastName && foreName) {
              authors.push(`${foreName} ${lastName}`);
            } else if (lastName) {
              authors.push(lastName);
            }
          }
          
          // Extract MeSH terms
          const meshTerms: string[] = [];
          const meshMatches = articleXml.match(/<MeshHeading>([\s\S]*?)<\/MeshHeading>/g) || [];
          for (const meshXml of meshMatches) {
            const descriptor = this.extractTagContent(meshXml, 'DescriptorName');
            if (descriptor) {
              meshTerms.push(descriptor);
            }
          }
          
          // Extract publication types
          const publicationTypes: string[] = [];
          const pubTypeMatches = articleXml.match(/<PublicationType[^>]*>([\s\S]*?)<\/PublicationType>/g) || [];
          for (const pubTypeXml of pubTypeMatches) {
            const pubType = pubTypeXml.replace(/<[^>]+>/g, '').trim();
            if (pubType) {
              publicationTypes.push(pubType);
            }
          }
          
          if (pmid && title) {
            articles.push({
              pmid,
              title,
              abstract: abstract || '',
              authors,
              journal: journal || '',
              publicationDate: pubDate,
              meshTerms,
              keywords: [], // Keywords would be extracted from KeywordList if available
              language,
              publicationType: publicationTypes
            });
          }
        } catch (parseError) {
          logger.warn('Failed to parse individual PubMed article:', parseError);
        }
      }
      
      return articles;
    } catch (error) {
      logger.error('Failed to parse PubMed XML response:', error);
      return [];
    }
  }

  /**
   * Extract content from XML tag
   * @param xml XML string
   * @param tagName Tag name to extract
   * @param parentTagName Optional parent tag name
   */
  private extractTagContent(xml: string, tagName: string, parentTagName?: string): string | null {
    try {
      let searchXml = xml;
      
      // If parent tag is specified, limit search to that section
      if (parentTagName) {
        const parentMatch = xml.match(new RegExp(`<${parentTagName}[^>]*>([\\s\\S]*?)<\\/${parentTagName}>`, 'i'));
        if (parentMatch && parentMatch[1]) {
          searchXml = parentMatch[1];
        }
      }
      
      const tagPattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
      const match = searchXml.match(tagPattern);
      
      if (match && match[1]) {
        // Remove any nested tags and trim
        return match[1].replace(/<[^>]+>/g, '').trim() || null;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract publication date from XML
   * @param xml Article XML
   */
  private extractPublicationDate(xml: string): string {
    try {
      // Try to extract Year, Month, Day
      const year = this.extractTagContent(xml, 'Year', 'PubDate');
      const month = this.extractTagContent(xml, 'Month', 'PubDate');
      const day = this.extractTagContent(xml, 'Day', 'PubDate');
      
      if (year) {
        if (month && day) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (month) {
          return `${year}-${month.padStart(2, '0')}`;
        }
        return year;
      }
      
      // Try to extract MedlineDate as fallback
      const medlineDate = this.extractTagContent(xml, 'MedlineDate', 'PubDate');
      if (medlineDate) {
        return medlineDate;
      }
      
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Get related articles for a given PMID
   * @param pmid PubMed ID
   * @param maxResults Maximum number of related articles to return
   */
  async getRelatedArticles(pmid: string, maxResults: number = 10): Promise<PubMedArticle[]> {
    try {
      // Use PubMed's built-in related articles feature
      const params = new URLSearchParams({
        db: 'pubmed',
        uid: pmid,
        retmax: maxResults.toString(),
        retmode: 'xml'
      });

      if (this.apiKey) {
        params.append('api_key', this.apiKey);
      }

      const response = await axios.get(`${this.baseUrl}/elink.fcgi`, {
        params
      });

      // Parse the response to get related PMIDs
      const pmidMatches = response.data.match(/<Id>(\d+)<\/Id>/g) || [];
      const relatedPmids = pmidMatches.map((match: string) => match.replace(/<[^>]+>/g, ''));
      
      if (relatedPmids.length === 0) {
        return [];
      }

      // Fetch details for related articles
      const fetchParams = new URLSearchParams({
        db: 'pubmed',
        id: relatedPmids.join(','),
        retmode: 'xml'
      });

      if (this.apiKey) {
        fetchParams.append('api_key', this.apiKey);
      }

      const fetchResponse = await axios.get(`${this.baseUrl}/efetch.fcgi`, {
        params: fetchParams
      });

      return this.parseXMLResponse(fetchResponse.data);

    } catch (error) {
      logger.error(`Failed to fetch related articles for PMID ${pmid}:`, error);
      return [];
    }
  }
}

// Singleton instance
export const pubmedService = new PubMedService(process.env.PUBMED_API_KEY);