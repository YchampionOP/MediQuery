import { Request, Response, Router } from 'express';
import { patientEducationService } from '../services/patientEducation';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/education/content/:topic - Get educational content for a topic
router.get('/content/:topic', async (req: Request, res: Response) => {
  try {
    const { topic } = req.params;
    const { language } = req.query;
    const userRole: string = 'clinician'; // Default role for hackathon

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Topic is required',
        },
      });
    }

    // Get user's health literacy assessment if available
    const literacyAssessment = await patientEducationService.getHealthLiteracyAssessment('hackathon-user');
    const readingLevel = literacyAssessment?.readingLevel;

    const content = await patientEducationService.getEducationalContent(
      topic,
      readingLevel,
      (language as string) || 'English'
    );

    // Filter content based on user role
    const filteredContent = userRole === 'patient' ? 
      content.filter(item => item.readingLevel <= 10) : // Limit complexity for patients
      content;

    return res.json({
      success: true,
      data: {
        content: filteredContent,
        totalItems: filteredContent.length,
        topic,
        userReadingLevel: readingLevel,
        language: (language as string) || 'English'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Educational content request failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve educational content',
      },
    });
  }
});

// POST /api/education/explain - Explain medical terms or content
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { text, term, targetReadingLevel } = req.body;
    const userRole: string = 'clinician'; // Default role for hackathon

    if (!text && !term) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Either text or term is required',
        },
      });
    }

    let result: any = {};

    if (term) {
      // Explain a specific medical term
      const explanation = await patientEducationService.explainMedicalTerm(term);
      result = {
        type: 'term_explanation',
        term,
        explanation
      };
    } else if (text) {
      // Translate medical text to plain language
      const userAssessment = await patientEducationService.getHealthLiteracyAssessment('hackathon-user');
      const readingLevel = targetReadingLevel || userAssessment?.readingLevel || 6;
      
      const translation = await patientEducationService.translateToPlainLanguage(
        text,
        readingLevel,
        userAssessment || undefined
      );
      
      result = {
        type: 'text_translation',
        originalText: text,
        ...translation
      };
    }

    return res.json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Medical explanation request failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to provide medical explanation',
      },
    });
  }
});

// POST /api/education/question - Answer patient questions
router.post('/question', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    const userRole: string = 'clinician'; // Default role for hackathon

    if (!question) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Question is required',
        },
      });
    }

    const userAssessment = await patientEducationService.getHealthLiteracyAssessment('hackathon-user');
    const answer = await patientEducationService.answerPatientQuestion(question, userAssessment || undefined);

    if (!answer) {
      return res.json({
        success: true,
        data: {
          answer: {
            question,
            answer: "I don't have a specific answer for your question, but I recommend discussing this with your healthcare provider. They can give you personalized information based on your specific situation.",
            category: 'general',
            relatedTerms: [],
            confidence: 0.3
          },
          suggestion: 'Consider contacting your healthcare provider for personalized guidance'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        answer,
        userReadingLevel: userAssessment?.readingLevel,
        followUpSuggestions: [
          'Would you like more information about this topic?',
          'Do you have other questions about your health?',
          'Would you like to speak with a healthcare provider?'
        ]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Patient question answering failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to answer patient question',
      },
    });
  }
});

// POST /api/education/literacy-assessment - Save health literacy assessment
router.post('/literacy-assessment', async (req: Request, res: Response) => {
  try {
    const assessmentData = req.body;
    const userId = 'hackathon-user'; // Default user ID for hackathon

    const assessment = {
      ...assessmentData,
      userId,
      completedAt: new Date().toISOString()
    };

    await patientEducationService.saveHealthLiteracyAssessment(assessment);

    return res.json({
      success: true,
      data: {
        message: 'Health literacy assessment saved successfully',
        userId,
        completedAt: assessment.completedAt
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Literacy assessment save failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to save health literacy assessment',
      },
    });
  }
});

// GET /api/education/literacy-assessment - Get user's health literacy assessment
router.get('/literacy-assessment', async (req: Request, res: Response) => {
  try {
    const userId = 'hackathon-user'; // Default user ID for hackathon
    const assessment = await patientEducationService.getHealthLiteracyAssessment(userId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'No health literacy assessment found for user',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        assessment
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Literacy assessment retrieval failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve health literacy assessment',
      },
    });
  }
});

// POST /api/education/personalized-plan - Create personalized education plan
router.post('/personalized-plan', async (req: Request, res: Response) => {
  try {
    const { conditions } = req.body;
    const userId = 'hackathon-user'; // Default user ID for hackathon

    if (!conditions || !Array.isArray(conditions)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Conditions array is required',
        },
      });
    }

    const literacyAssessment = await patientEducationService.getHealthLiteracyAssessment(userId);
    
    if (!literacyAssessment) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PrerequisiteNotMet',
          message: 'Health literacy assessment required before creating personalized plan',
        },
      });
    }

    const educationPlan = await patientEducationService.createPersonalizedEducationPlan(
      userId,
      conditions,
      literacyAssessment
    );

    return res.json({
      success: true,
      data: {
        ...educationPlan,
        userId,
        conditions,
        createdAt: new Date().toISOString()
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Personalized education plan creation failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to create personalized education plan',
      },
    });
  }
});

// GET /api/education/resources/:topic - Get educational resources for a topic
router.get('/resources/:topic', async (req: Request, res: Response) => {
  try {
    const { topic } = req.params;
    const { verified } = req.query;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Topic is required',
        },
      });
    }

    const onlyVerified = verified !== 'false'; // Default to true unless explicitly false
    const resources = await patientEducationService.getTopicResources(topic, onlyVerified);

    return res.json({
      success: true,
      data: {
        resources,
        totalResources: resources.length,
        topic,
        verifiedOnly: onlyVerified,
        resourceTypes: {
          website: resources.filter(r => r.type === 'website').length,
          video: resources.filter(r => r.type === 'video').length,
          brochure: resources.filter(r => r.type === 'brochure').length,
          app: resources.filter(r => r.type === 'app').length,
          support_group: resources.filter(r => r.type === 'support_group').length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Educational resources request failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve educational resources',
      },
    });
  }
});

export default router;