import { Request, Response, Router } from 'express';
import { PatientModel } from '../models/Patient';
import { elasticsearchService } from '../services/elasticsearch';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/patient/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Patient ID is required',
        },
      });
    }

    // Get patient record from Elasticsearch
    const patientDoc = await elasticsearchService.getDocument('patients', id);
    
    if (!patientDoc) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Patient not found',
        },
      });
    }

    // Create patient model and apply role-based filtering
    const patient = new PatientModel(patientDoc._source);
    const patientData = patient.toElasticsearchDocument();
    
    // Filter sensitive information for patients (default to clinician view for hackathon)
    // In hackathon mode, we'll show all data
    patientData.summary = patient.generateSearchSummary();

    return res.json({
      success: true,
      data: patientData,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to get patient ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve patient data',
      },
    });
  }
});

// GET /api/patient/:id/timeline
router.get('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, eventTypes } = req.query;
    
    // Search for all events related to this patient
    const searchBody: any = {
      query: {
        bool: {
          must: [
            { term: { 'patient_id.keyword': id } }
          ],
          filter: []
        }
      },
      sort: [
        { timestamp: { order: 'desc' } }
      ],
      size: 100
    };

    // Add date range filter
    if (startDate || endDate) {
      const rangeFilter: any = {
        range: {
          timestamp: {}
        }
      };
      
      if (startDate) {
        rangeFilter.range.timestamp.gte = startDate as string;
      }
      
      if (endDate) {
        rangeFilter.range.timestamp.lte = endDate as string;
      }
      
      searchBody.query.bool.filter.push(rangeFilter);
    }

    // Add event type filter
    if (eventTypes) {
      const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
      searchBody.query.bool.filter.push({
        terms: { 'type.keyword': types }
      });
    }

    const response = await elasticsearchService.search({
      index: ['clinical-notes', 'lab-results', 'medications'],
      body: searchBody
    });

    const timelineEvents = response.hits.hits.map((hit: any) => ({
      id: hit._source.id,
      type: hit._source.type,
      title: hit._source.title,
      description: hit._source.summary,
      timestamp: hit._source.timestamp,
      category: hit._source.category || 'general',
      significance: hit._source.severity === 'high' ? 'high' : 'medium',
      source: hit._source.source
    }));

    return res.json({
      success: true,
      data: {
        patientId: id,
        events: timelineEvents,
        totalEvents: response.hits.total.value,
        dateRange: {
          start: startDate,
          end: endDate
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to get patient timeline ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve patient timeline',
      },
    });
  }
});

// GET /api/patient/:id/conditions
router.get('/:id/conditions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, category } = req.query;
    
    const patient = await elasticsearchService.getDocument('patients', id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Patient not found',
        },
      });
    }

    let conditions = patient._source.conditions || [];
    
    // Filter by status
    if (status) {
      conditions = conditions.filter((c: any) => c.status === (status as string));
    }
    
    // Filter by category
    if (category) {
      conditions = conditions.filter((c: any) => c.category === (category as string));
    }

    return res.json({
      success: true,
      data: {
        patientId: id,
        conditions,
        totalConditions: conditions.length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to get patient conditions ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve patient conditions',
      },
    });
  }
});

// GET /api/patient/:id/medications
router.get('/:id/medications', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, medicationClass } = req.query;
    
    const searchBody: any = {
      query: {
        bool: {
          must: [
            { term: { 'patient_id.keyword': id } },
            { term: { 'type.keyword': 'medication' } }
          ],
          filter: []
        }
      },
      sort: [{ start_date: { order: 'desc' } }]
    };

    if (status) {
      searchBody.query.bool.filter.push({
        term: { 'status.keyword': status as string }
      });
    }

    if (medicationClass) {
      searchBody.query.bool.filter.push({
        term: { 'medication_class.keyword': medicationClass as string }
      });
    }

    const response = await elasticsearchService.search({
      index: 'medications',
      body: searchBody
    });

    const medications = response.hits.hits.map((hit: any) => hit._source);

    return res.json({
      success: true,
      data: {
        patientId: id,
        medications,
        totalMedications: medications.length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to get patient medications ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve patient medications',
      },
    });
  }
});

// GET /api/patient/:id/lab-results
router.get('/:id/lab-results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { testName, dateRange, status } = req.query;
    
    const searchBody: any = {
      query: {
        bool: {
          must: [
            { term: { 'patient_id.keyword': id } },
            { term: { 'type.keyword': 'lab-result' } }
          ],
          filter: []
        }
      },
      sort: [{ timestamp: { order: 'desc' } }],
      size: 50
    };

    if (testName) {
      searchBody.query.bool.must.push({
        match: { test_name: testName as string }
      });
    }

    if (status) {
      searchBody.query.bool.filter.push({
        term: { 'status.keyword': status as string }
      });
    }

    if (dateRange) {
      const dateRangeStr = dateRange as string;
      const [start, end] = dateRangeStr.split(',');
      searchBody.query.bool.filter.push({
        range: {
          timestamp: {
            gte: start,
            lte: end
          }
        }
      });
    }

    const response = await elasticsearchService.search({
      index: 'lab-results',
      body: searchBody
    });

    const labResults = response.hits.hits.map((hit: any) => hit._source);

    return res.json({
      success: true,
      data: {
        patientId: id,
        labResults,
        totalResults: labResults.length
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to get patient lab results ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve patient lab results',
      },
    });
  }
});

export default router;