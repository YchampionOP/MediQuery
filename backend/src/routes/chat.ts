import { Request, Response, Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// In-memory storage for chat sessions (in production, use a database)
const chatSessions: Record<string, any> = {};

// POST /api/chat/sessions - Create or join a chat session
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { sessionId, userRole, patientId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Session ID is required',
        },
      });
    }

    // Create or update session
    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = {
        id: sessionId,
        userId: 'hackathon-user', // Default user ID for hackathon
        userRole: userRole || 'clinician', // Default role for hackathon
        patientId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Update existing session
      chatSessions[sessionId].updatedAt = new Date().toISOString();
    }

    return res.json({
      success: true,
      data: {
        session: chatSessions[sessionId],
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Chat session creation failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to create chat session',
      },
    });
  }
});

// POST /api/chat/sessions/save - Save chat session
router.post('/sessions/save', async (req: Request, res: Response) => {
  try {
    const { sessionId, messages, userRole, patientId } = req.body;
    
    if (!sessionId || !messages) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Session ID and messages are required',
        },
      });
    }

    // Save session
    chatSessions[sessionId] = {
      id: sessionId,
      userId: 'hackathon-user', // Default user ID for hackathon
      userRole: userRole || 'clinician', // Default role for hackathon
      patientId,
      messages,
      createdAt: chatSessions[sessionId]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: {
        message: 'Chat session saved successfully',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Chat session save failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to save chat session',
      },
    });
  }
});

// GET /api/chat/sessions/:sessionId - Get chat session
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Session ID is required',
        },
      });
    }

    const session = chatSessions[sessionId];
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Chat session not found',
        },
      });
    }

    // For hackathon, allow access to any session
    // In production, you would check if user has access to this session

    return res.json({
      success: true,
      data: {
        session,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Chat session retrieval failed:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'InternalServerError',
        message: 'Failed to retrieve chat session',
      },
    });
  }
});

// POST /api/chat/stream - Stream chat responses (simulated SSE)
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { message, sessionId, userRole, patientId, tool } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Message and session ID are required',
        },
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send initial response
    res.write(`data: ${JSON.stringify({ type: 'content', content: 'I understand your question about ' })}\n\n`);
    
    // Simulate streaming response
    const words = message.split(' ');
    for (let i = 0; i < Math.min(words.length, 5); i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      res.write(`data: ${JSON.stringify({ type: 'content', content: `${words[i]} ` })}\n\n`);
    }

    // Simulate search results for specific queries
    if (message.toLowerCase().includes('diabetes') || message.toLowerCase().includes('blood sugar')) {
      await new Promise(resolve => setTimeout(resolve, 500));
      res.write(`data: ${JSON.stringify({ 
        type: 'search_results', 
        results: [
          {
            id: 'result-1',
            title: 'Diabetes Management Guidelines',
            summary: 'Latest clinical guidelines for Type 2 diabetes management with HbA1c targets and medication recommendations.',
            relevanceScore: 0.95,
            source: 'Clinical Guidelines Database',
            type: 'research',
            highlights: ['diabetes', 'HbA1c', 'management'],
            metadata: {},
            timestamp: new Date().toISOString()
          },
          {
            id: 'result-2',
            title: 'Patient: John Smith - Blood Sugar Trends',
            summary: 'Recent HbA1c levels showing improvement from 8.5% to 7.8% over the past 3 months.',
            relevanceScore: 0.88,
            source: 'Patient Records',
            type: 'patient',
            highlights: ['HbA1c', 'blood sugar', 'trends'],
            metadata: {},
            timestamp: new Date().toISOString()
          }
        ]
      })}\n\n`);
    }

    // Simulate suggestions
    await new Promise(resolve => setTimeout(resolve, 300));
    res.write(`data: ${JSON.stringify({ 
      type: 'suggestions', 
      suggestions: [
        'What are the latest treatment options for diabetes?',
        'How can I improve my patient\'s blood sugar control?',
        'Show me similar patient cases'
      ]
    })}\n\n`);

    // Simulate tool calls for clinicians
    if ((userRole || 'clinician') === 'clinician' && tool) {
      await new Promise(resolve => setTimeout(resolve, 400));
      res.write(`data: ${JSON.stringify({ 
        type: 'tool_call',
        tool_call: {
          id: 'tool-1',
          name: tool,
          arguments: { query: message, patientId },
          result: `Executed ${tool} tool successfully`
        }
      })}\n\n`);
    }

    // Send completion
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    
    // End the response
    res.end();
    return;

  } catch (error) {
    logger.error('Chat streaming failed:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'InternalServerError',
          message: 'Failed to process chat message',
        },
      });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Processing failed' })}\n\n`);
      res.end();
      return;
    }
  }
});

export default router;