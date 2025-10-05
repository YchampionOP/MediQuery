import { Request, Response, Router } from 'express';
import { clinicalDecisionSupportService } from '../services/clinicalDecisionSupport';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/clinical/recommendations - Get clinical recommendations
router.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { patientConditions, medications, labResults } = req.body;

    if (!patientConditions || !Array.isArray(patientConditions)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Patient conditions array is required',
        },
      });
    }

    const recommendations = await clinicalDecisionSupportService.getClinicalRecommendations(
      patientConditions,
      medications || [],
      labResults
    );

    return res.json({
      success: true,
      data: {
        recommendations,
        totalRecommendations: recommendations.length,
        patientConditions,
        generatedAt: new Date().toISOString()
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Clinical recommendations request failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to generate clinical recommendations',
      },
    });
  }
});

// POST /api/clinical/drug-interactions - Check for drug interactions
router.post('/drug-interactions', async (req: Request, res: Response) => {
  try {
    const { medications } = req.body;

    if (!medications || !Array.isArray(medications) || medications.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'At least two medications are required for interaction checking',
        },
      });
    }

    const interactions = await clinicalDecisionSupportService.checkDrugInteractions(medications);

    return res.json({
      success: true,
      data: {
        interactions,
        totalInteractions: interactions.length,
        medications,
        severityBreakdown: {
          major: interactions.filter(i => i.severity === 'Major').length,
          moderate: interactions.filter(i => i.severity === 'Moderate').length,
          minor: interactions.filter(i => i.severity === 'Minor').length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Drug interaction check failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to check drug interactions',
      },
    });
  }
});

// POST /api/clinical/alerts - Generate clinical alerts for a patient
router.post('/alerts', async (req: Request, res: Response) => {
  try {
    const { patientId, patientData } = req.body;

    if (!patientId || !patientData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Patient ID and patient data are required',
        },
      });
    }

    const alerts = await clinicalDecisionSupportService.generateClinicalAlerts(
      patientId,
      patientData
    );

    return res.json({
      success: true,
      data: {
        alerts,
        totalAlerts: alerts.length,
        patientId,
        severityBreakdown: {
          critical: alerts.filter(a => a.severity === 'Critical').length,
          high: alerts.filter(a => a.severity === 'High').length,
          medium: alerts.filter(a => a.severity === 'Medium').length,
          low: alerts.filter(a => a.severity === 'Low').length,
          info: alerts.filter(a => a.severity === 'Info').length
        },
        typeBreakdown: {
          'Drug Interaction': alerts.filter(a => a.type === 'Drug Interaction').length,
          'Allergy': alerts.filter(a => a.type === 'Allergy').length,
          'Quality Measure': alerts.filter(a => a.type === 'Quality Measure').length,
          'Contraindication': alerts.filter(a => a.type === 'Contraindication').length,
          'Dosing': alerts.filter(a => a.type === 'Dosing').length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Clinical alerts generation failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to generate clinical alerts',
      },
    });
  }
});

// GET /api/clinical/evidence/:query - Search for clinical evidence
router.get('/evidence/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { conditions } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Search query is required',
        },
      });
    }

    const conditionsArray = conditions ? 
      (Array.isArray(conditions) ? conditions : [conditions]) as string[] : [];

    const evidence = await clinicalDecisionSupportService.searchEvidence(query, conditionsArray);

    return res.json({
      success: true,
      data: {
        evidence,
        totalResults: evidence.length,
        query,
        conditions: conditionsArray,
        studyTypeBreakdown: {
          'RCT': evidence.filter(e => e.studyType === 'RCT').length,
          'Systematic Review': evidence.filter(e => e.studyType === 'Systematic Review').length,
          'Meta-Analysis': evidence.filter(e => e.studyType === 'Meta-Analysis').length,
          'Cohort': evidence.filter(e => e.studyType === 'Cohort').length,
          'Case-Control': evidence.filter(e => e.studyType === 'Case-Control').length,
          'Case Series': evidence.filter(e => e.studyType === 'Case Series').length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Evidence search failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to search clinical evidence',
      },
    });
  }
});

// GET /api/clinical/guidelines - Get clinical guidelines for conditions
router.get('/guidelines', async (req: Request, res: Response) => {
  try {
    const { conditions } = req.query;

    if (!conditions) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Conditions parameter is required',
        },
      });
    }

    const conditionsArray = Array.isArray(conditions) ? conditions as string[] : [conditions as string];
    const guidelines = await clinicalDecisionSupportService.getClinicalGuidelines(conditionsArray);

    return res.json({
      success: true,
      data: {
        guidelines,
        totalGuidelines: guidelines.length,
        conditions: conditionsArray,
        evidenceLevelBreakdown: {
          'A': guidelines.filter(g => g.evidenceLevel === 'A').length,
          'B': guidelines.filter(g => g.evidenceLevel === 'B').length,
          'C': guidelines.filter(g => g.evidenceLevel === 'C').length,
          'D': guidelines.filter(g => g.evidenceLevel === 'D').length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Guidelines retrieval failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve clinical guidelines',
      },
    });
  }
});

// GET /api/clinical/quality-measures - Get quality measures for conditions
router.get('/quality-measures', async (req: Request, res: Response) => {
  try {
    const { conditions } = req.query;

    if (!conditions) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Conditions parameter is required',
        },
      });
    }

    const conditionsArray = Array.isArray(conditions) ? conditions as string[] : [conditions as string];
    const measures = await clinicalDecisionSupportService.getQualityMeasures(conditionsArray);

    return res.json({
      success: true,
      data: {
        measures,
        totalMeasures: measures.length,
        conditions: conditionsArray,
        categoryBreakdown: {
          'Process': measures.filter(m => m.category === 'Process').length,
          'Outcome': measures.filter(m => m.category === 'Outcome').length,
          'Structure': measures.filter(m => m.category === 'Structure').length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Quality measures retrieval failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve quality measures',
      },
    });
  }
});

// POST /api/clinical/alerts/:alertId/acknowledge - Acknowledge a clinical alert
router.post('/alerts/:alertId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const userId = 'hackathon-user'; // Default user ID for hackathon

    if (!alertId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Alert ID is required',
        },
      });
    }

    const acknowledged = await clinicalDecisionSupportService.acknowledgeAlert(alertId, userId);

    return res.json({
      success: true,
      data: {
        alertId,
        acknowledged,
        acknowledgedBy: userId,
        acknowledgedAt: new Date().toISOString()
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Alert acknowledgment failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to acknowledge alert',
      },
    });
  }
});

// GET /api/clinical/alerts/history/:patientId - Get alert history for a patient
router.get('/alerts/history/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { days } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Patient ID is required',
        },
      });
    }

    const alertDays = days ? parseInt(days as string) : 30;
    const alertHistory = await clinicalDecisionSupportService.getAlertHistory(patientId, alertDays);

    return res.json({
      success: true,
      data: {
        alertHistory,
        totalAlerts: alertHistory.length,
        patientId,
        timeRange: `${alertDays} days`,
        startDate: new Date(Date.now() - alertDays * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Alert history retrieval failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve alert history',
      },
    });
  }
});

export default router;