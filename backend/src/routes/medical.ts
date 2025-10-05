import { Router, Request, Response } from 'express';
import { elasticsearchService } from '../services/elasticsearch';

const router = Router();

// Get all medical codes with optional filtering
router.get('/codes', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type, query, limit = 100 } = req.query;
    
    // Search for medical codes in Elasticsearch
    const searchParams: any = {
      index: 'medical-codes',
      size: parseInt(limit as string)
    };

    const searchBody: any = {
      query: {
        bool: {
          must: []
        }
      }
    };

    // Add type filter if specified
    if (type) {
      searchBody.query.bool.must.push({
        term: {
          'codeSystem': type
        }
      });
    }

    // Add text search if query provided
    if (query) {
      searchBody.query.bool.must.push({
        multi_match: {
          query: query,
          fields: ['code', 'description', 'longDescription'],
          type: 'phrase_prefix'
        }
      });
    }

    // If no filters, match all
    if (searchBody.query.bool.must.length === 0) {
      searchBody.query = {
        match_all: {}
      };
    }

    searchParams.body = searchBody;
    const result = await elasticsearchService.search(searchParams);
    
    return res.json({
      success: true,
      data: {
        codes: result.hits.hits.map((hit: any) => ({
          id: hit._id,
          ...hit._source
        })),
        total: result.hits.total.value,
        took: result.took
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('Error fetching medical codes:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MEDICAL_CODES_FETCH_ERROR',
        message: 'Failed to fetch medical codes',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Get specific medical code by ID
router.get('/codes/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const result = await elasticsearchService.getDocument('medical-codes', id);
    
    if (!result || !result.found) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEDICAL_CODE_NOT_FOUND',
          message: 'Medical code not found'
        }
      });
    }
    
    return res.json({
      success: true,
      data: {
        code: {
          id: result._id,
          ...result._source
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('Error fetching medical code:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MEDICAL_CODE_FETCH_ERROR',
        message: 'Failed to fetch medical code',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Get medical codes by type (ICD-10, SNOMED-CT, CPT)
router.get('/codes/type/:type', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type } = req.params;
    const { limit = 100 } = req.query;
    
    const validTypes = ['ICD-10', 'SNOMED-CT', 'CPT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE_TYPE',
          message: `Invalid code type. Must be one of: ${validTypes.join(', ')}`
        }
      });
    }
    
    const searchParams: any = {
      index: 'medical-codes',
      size: parseInt(limit as string),
      body: {
        query: {
          term: {
            'codeSystem': type
          }
        }
      }
    };

    const result = await elasticsearchService.search(searchParams);
    
    return res.json({
      success: true,
      data: {
        codes: result.hits.hits.map((hit: any) => ({
          id: hit._id,
          ...hit._source
        })),
        total: result.hits.total.value,
        took: result.took
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('Error fetching medical codes by type:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MEDICAL_CODES_BY_TYPE_FETCH_ERROR',
        message: 'Failed to fetch medical codes by type',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Search for medical codes with advanced filtering
router.post('/codes/search', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { query, filters, limit = 100, offset = 0 } = req.body;
    
    const searchParams: any = {
      index: 'medical-codes',
      from: offset,
      size: limit
    };

    const searchBody: any = {
      query: {
        bool: {
          must: []
        }
      }
    };

    // Add text search if query provided
    if (query) {
      searchBody.query.bool.must.push({
        multi_match: {
          query: query,
          fields: ['code', 'description', 'longDescription'],
          type: 'best_fields'
        }
      });
    }

    // Add filters if provided
    if (filters) {
      if (filters.codeSystem) {
        searchBody.query.bool.must.push({
          term: {
            'codeSystem': filters.codeSystem
          }
        });
      }
      
      if (filters.category) {
        searchBody.query.bool.must.push({
          term: {
            'category': filters.category
          }
        });
      }
    }

    // If no filters, match all
    if (searchBody.query.bool.must.length === 0) {
      searchBody.query = {
        match_all: {}
      };
    }

    searchParams.body = searchBody;
    const result = await elasticsearchService.search(searchParams);
    
    return res.json({
      success: true,
      data: {
        codes: result.hits.hits.map((hit: any) => ({
          id: hit._id,
          ...hit._source
        })),
        total: result.hits.total.value,
        took: result.took
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error('Error searching medical codes:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'MEDICAL_CODES_SEARCH_ERROR',
        message: 'Failed to search medical codes',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;