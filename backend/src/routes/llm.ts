import { Request, Response, Router } from 'express';
import { localLLMService } from '../services/llmService';
import { UserRole } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/llm/chat - Generate LLM response for conversational queries
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { query, intent, additionalContext } = req.body;
    const userRole: UserRole = 'clinician'; // Default role for hackathon
    const userId = 'hackathon-user'; // Default user ID for hackathon

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Query is required',
        },
      });
    }

    // Get or create conversation context
    let context = localLLMService.getConversationContext(userId);
    if (!context) {
      context = {
        userId,
        userRole,
        previousQueries: [],
        ...additionalContext
      };
    }

    // Update conversation context
    localLLMService.updateConversationContext(userId, query, userRole, additionalContext);

    // Generate LLM response
    const response = await localLLMService.generateResponse(
      query,
      userRole,
      intent || 'general_inquiry',
      context!
    );

    return res.json({
      success: true,
      data: {
        response: response.text,
        confidence: response.confidence,
        processingTime: response.processingTime,
        medicalEntities: response.medicalEntities,
        suggestions: response.suggestions,
        educationalContent: response.educationalContent,
        metadata: {
          tokens: response.tokens,
          intent,
          userRole
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('LLM chat request failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to generate LLM response',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
    });
  }
});

// POST /api/llm/explain - Explain medical information in patient-friendly language
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { content, contentType } = req.body;
    const userRole: UserRole = 'clinician'; // Default role for hackathon
    const userId = 'hackathon-user'; // Default user ID for hackathon

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Content to explain is required',
        },
      });
    }

    const context = localLLMService.getConversationContext(userId) || {
      userId,
      userRole,
      previousQueries: []
    };

    const query = `Please explain this ${contentType || 'medical information'}: ${content}`;
    
    const response = await localLLMService.generateResponse(
      query,
      userRole,
      'explain_results',
      context
    );

    return res.json({
      success: true,
      data: {
        explanation: response.text,
        confidence: response.confidence,
        educationalContent: response.educationalContent,
        suggestions: response.suggestions,
        medicalEntities: response.medicalEntities
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('LLM explanation request failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to generate explanation',
      },
    });
  }
});

// POST /api/llm/clinical-support - Provide clinical decision support for clinicians
router.post('/clinical-support', async (req: Request, res: Response) => {
  try {
    const { clinicalScenario, patientData, questionType } = req.body;
    const userRole: UserRole = 'clinician'; // Default role for hackathon
    const userId = 'hackathon-user'; // Default user ID for hackathon

    // For hackathon, allow access to all users but default to clinician role
    // In production, restrict to clinicians only

    if (!clinicalScenario) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Clinical scenario is required',
        },
      });
    }

    const context = localLLMService.getConversationContext(userId) || {
      userId,
      userRole,
      previousQueries: [],
      medicalHistory: patientData?.medicalHistory,
      medications: patientData?.medications,
      currentSymptoms: patientData?.symptoms
    };

    const intent = questionType === 'diagnosis' ? 'diagnosis_support' : 
                   questionType === 'medication' ? 'medication_review' : 
                   'clinical_consultation';

    const response = await localLLMService.generateResponse(
      clinicalScenario,
      userRole,
      intent,
      context
    );

    return res.json({
      success: true,
      data: {
        clinicalInsights: response.text,
        confidence: response.confidence,
        recommendations: response.suggestions,
        medicalCodes: response.medicalEntities,
        processingTime: response.processingTime
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Clinical support request failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to provide clinical support',
      },
    });
  }
});

// GET /api/llm/context/:userId - Get conversation context for a user
router.get('/context/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // For hackathon, allow access to any user context
    // In production, users can only access their own context, clinicians can access any

    const context = localLLMService.getConversationContext(userId);

    if (!context) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'No conversation context found for user',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        context: {
          userId: context.userId,
          userRole: context.userRole,
          previousQueries: context.previousQueries,
          queryCount: context.previousQueries.length
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Failed to get conversation context:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve conversation context',
      },
    });
  }
});

// DELETE /api/llm/context/:userId - Clear conversation context
router.delete('/context/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // For hackathon, allow clearing any user context
    // In production, users can only clear their own context, clinicians can clear any

    localLLMService.clearConversationContext(userId);

    return res.json({
      success: true,
      data: {
        message: 'Conversation context cleared successfully'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('Failed to clear conversation context:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to clear conversation context',
      },
    });
  }
});

// GET /api/llm/health - Check LLM service health
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await localLLMService.healthCheck();
    const modelInfo = localLLMService.getModelInfo();

    return res.json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        modelInfo,
        timestamp: new Date().toISOString()
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });

  } catch (error) {
    logger.error('LLM health check failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Health check failed',
      },
    });
  }
});

export default router;