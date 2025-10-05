import { Request, Response, Router } from 'express';
import { elasticsearchService } from '../services/elasticsearch';
import { logger } from '../utils/logger';

const router = Router();

// Export patient record as PDF
router.post('/pdf/patient/:id', async (req: Request, res: Response) => {
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

    // For demo purposes, we'll return a simplified PDF-like response
    // In a real implementation, this would generate an actual PDF
    const patientData = patientDoc._source;
    
    return res.json({
      success: true,
      data: {
        id: patientDoc._id,
        type: 'patient-record',
        content: {
          patientInfo: {
            id: patientData.patient_id,
            name: patientData.demographics?.name || 'Unknown',
            age: patientData.age,
            gender: patientData.demographics?.gender,
            dateOfBirth: patientData.demographics?.date_of_birth,
          },
          conditions: patientData.conditions || [],
          admissions: patientData.admissions || [],
          createdAt: patientData.created_at,
        },
        format: 'pdf',
        message: 'In a complete implementation, this would generate a PDF file. For demo purposes, returning structured data.'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to export patient ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to export patient data',
      },
    });
  }
});

// Export clinical note as PDF
router.post('/pdf/clinical-note/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Clinical note ID is required',
        },
      });
    }

    // Get clinical note from Elasticsearch
    const noteDoc = await elasticsearchService.getDocument('clinical-notes', id);
    
    if (!noteDoc) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Clinical note not found',
        },
      });
    }

    // For demo purposes, we'll return a simplified response
    const noteData = noteDoc._source;
    
    return res.json({
      success: true,
      data: {
        id: noteDoc._id,
        type: 'clinical-note',
        content: {
          noteId: noteData.note_id,
          patientId: noteData.patient_id,
          date: noteData.chartdate,
          category: noteData.category,
          content: noteData.text,
          createdAt: noteData.created_at,
        },
        format: 'pdf',
        message: 'In a complete implementation, this would generate a PDF file. For demo purposes, returning structured data.'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to export clinical note ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to export clinical note',
      },
    });
  }
});

// Export lab result as PDF
router.post('/pdf/lab-result/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Lab result ID is required',
        },
      });
    }

    // Get lab result from Elasticsearch
    const labDoc = await elasticsearchService.getDocument('lab-results', id);
    
    if (!labDoc) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Lab result not found',
        },
      });
    }

    // For demo purposes, we'll return a simplified response
    const labData = labDoc._source;
    
    return res.json({
      success: true,
      data: {
        id: labDoc._id,
        type: 'lab-result',
        content: {
          labId: labData.lab_id,
          patientId: labData.patient_id,
          testName: labData.label,
          value: labData.value,
          units: labData.valueuom,
          date: labData.charttime,
          createdAt: labData.created_at,
        },
        format: 'pdf',
        message: 'In a complete implementation, this would generate a PDF file. For demo purposes, returning structured data.'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to export lab result ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to export lab result',
      },
    });
  }
});

// Export medication as PDF
router.post('/pdf/medication/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Medication ID is required',
        },
      });
    }

    // Get medication from Elasticsearch
    const medDoc = await elasticsearchService.getDocument('medications', id);
    
    if (!medDoc) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Medication not found',
        },
      });
    }

    // For demo purposes, we'll return a simplified response
    const medData = medDoc._source;
    
    return res.json({
      success: true,
      data: {
        id: medDoc._id,
        type: 'medication',
        content: {
          prescriptionId: medData.prescription_id,
          patientId: medData.patient_id,
          drug: medData.drug,
          dosage: medData.dosage,
          frequency: medData.frequency,
          route: medData.route,
          startDate: medData.startdate,
          endDate: medData.enddate,
          createdAt: medData.created_at,
        },
        format: 'pdf',
        message: 'In a complete implementation, this would generate a PDF file. For demo purposes, returning structured data.'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to export medication ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to export medication',
      },
    });
  }
});

// Generic export endpoint
router.post('/pdf/:index/:id', async (req: Request, res: Response) => {
  try {
    const { index, id } = req.params;
    
    if (!index || !id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Index and ID are required',
        },
      });
    }

    // Validate index
    const validIndices = ['patients', 'clinical-notes', 'lab-results', 'medications'];
    if (!validIndices.includes(index)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: `Invalid index. Valid indices: ${validIndices.join(', ')}`,
        },
      });
    }

    // Get document from Elasticsearch
    const doc = await elasticsearchService.getDocument(index, id);
    
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Document not found',
        },
      });
    }

    // For demo purposes, we'll return a simplified response
    const docData = doc._source;
    
    return res.json({
      success: true,
      data: {
        id: doc._id,
        index: index,
        content: docData,
        format: 'pdf',
        message: 'In a complete implementation, this would generate a PDF file. For demo purposes, returning structured data.'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error(`Failed to export document ${req.params.index}/${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to export document',
      },
    });
  }
});

export default router;