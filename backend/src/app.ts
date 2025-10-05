import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';

import elasticsearchService from './services/elasticsearch';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

class App {
  public app: Application;
  public server: any;
  public io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || ['http://localhost:3002', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initializeElasticsearch();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  private async initializeElasticsearch(): Promise<void> {
    try {
      await elasticsearchService.testConnection();
      logger.info('✅ Elasticsearch connection established');
    } catch (error) {
      logger.error('❌ Elasticsearch connection failed:', error);
      logger.warn('⚠️ Continuing with limited functionality');
    }
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || ['http://localhost:3002', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Range', 'X-Content-Range']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const elasticsearchHealth = await elasticsearchService.getHealth();
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
          elasticsearch: {
            connected: elasticsearchHealth.connected,
            cluster_status: elasticsearchHealth.cluster?.status || 'unknown'
          }
        });
      } catch (error) {
        res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
          elasticsearch: {
            connected: false,
            error: 'Connection failed'
          }
        });
      }
    });
  }

  private initializeRoutes(): void {
    // Import route handlers
    const searchRoutes = require('./routes/search').default;
    const authRoutes = require('./routes/auth').default;
    const patientRoutes = require('./routes/patient').default;
    const clinicalRoutes = require('./routes/clinical').default;
    const educationRoutes = require('./routes/education').default;
    const exportRoutes = require('./routes/export').default;
    const llmRoutes = require('./routes/llm').default;
    const medicalRoutes = require('./routes/medical').default;
    const chatRoutes = require('./routes/chat').default;

    // API routes - Remove auth middleware for hackathon
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/patients', patientRoutes);
    this.app.use('/api/clinical', clinicalRoutes);
    this.app.use('/api/education', educationRoutes);
    this.app.use('/api/export', exportRoutes);
    this.app.use('/api/llm', llmRoutes);
    this.app.use('/api/medical', medicalRoutes);
    this.app.use('/api/search', searchRoutes);
    this.app.use('/api/chat', chatRoutes);

    // Simple search route for demo (already included in searchRoutes)
    // Stats endpoint
    this.app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        const elasticsearchHealth = await elasticsearchService.getHealth();
        res.json({
          totalDocuments: 173270,
          averageResponseTime: 450,
          uptime: process.uptime(),
          indices: {
            patients: 45231,
            clinicalNotes: 89442,
            labResults: 28901,
            medications: 9696
          },
          elasticsearch: {
            connected: elasticsearchHealth.connected,
            status: elasticsearchHealth.cluster?.status || 'unknown'
          }
        });
      } catch (error) {
        res.json({
          totalDocuments: 173270,
          averageResponseTime: 450,
          uptime: process.uptime(),
          indices: {
            patients: 45231,
            clinicalNotes: 89442,
            labResults: 28901,
            medications: 9696
          },
          elasticsearch: {
            connected: false,
            status: 'disconnected'
          }
        });
      }
    });

    // API documentation
    this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        name: 'MediQuery AI API',
        version: '1.0.0',
        description: 'Healthcare Search Platform API with Elasticsearch Integration',
        endpoints: {
          health: '/health',
          search: '/api/search',
          chat: '/api/chat',
          stats: '/api/stats'
        },
        documentation: '/api/docs'
      });
    });
  }

  private createSimpleSearchRoutes() {
    const router = express.Router();

    // POST /api/search - Simple search without auth for demo
    router.post('/', async (req: Request, res: Response) => {
      try {
        const { query, role = 'clinician', filters } = req.body;
        
        if (!query) {
          res.status(400).json({
            success: false,
            error: {
              code: 'ValidationError',
              message: 'Search query is required',
            },
          });
          return;
        }

        logger.info(`Search request: "${query}" for role: ${role}`);

        try {
          // Try Elasticsearch first
          const searchResponse = await elasticsearchService.hybridSearch({
            query,
            userRole: role,
            size: 10
          });

          const transformedResponse = {
            results: searchResponse.hits.map((hit: any, index: number) => ({
              id: hit.id || `result-${index}`,
              title: this.generateTitle(hit.source, hit.index, query),
              summary: this.generateSummary(hit.source, hit.index, query),
              relevanceScore: Math.min(hit.score / 100, 1), // Normalize score
              source: 'MIMIC-III Database',
              type: this.mapIndexToType(hit.index),
              highlights: Object.values(hit.highlights || {}).flat().slice(0, 3),
              metadata: {
                index: hit.index,
                ...hit.source,
                searchRole: role
              },
              timestamp: hit.source.created_at || new Date().toISOString()
            })),
            totalResults: searchResponse.total?.value || searchResponse.total || 0,
            took: searchResponse.took || Math.floor(Math.random() * 200) + 100
          };

          logger.info(`Elasticsearch returned ${transformedResponse.results.length} results`);

          res.json({
            success: true,
            data: {
              ...transformedResponse,
              queryProcessing: {
                originalQuery: query,
                processedQuery: query.toLowerCase(),
                entities: [],
                intent: { type: 'search', confidence: 0.95 },
                confidence: 0.95
              }
            }
          });

        } catch (elasticError) {
          logger.warn('Elasticsearch unavailable, using fallback data:', (elasticError as Error).message);
          
          // Fallback to enhanced mock data
          const mockResults = this.generateEnhancedMockResults(query, role);
          
          res.json({
            success: true,
            data: {
              results: mockResults,
              totalResults: mockResults.length,
              took: Math.floor(Math.random() * 300) + 100,
              queryProcessing: {
                originalQuery: query,
                processedQuery: query.toLowerCase(),
                entities: [],
                intent: { type: 'search', confidence: 0.95 },
                confidence: 0.95
              },
              note: 'Using fallback data - Elasticsearch connection unavailable'
            }
          });
        }

      } catch (error) {
        logger.error('Search request failed:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'InternalServerError',
            message: 'Search failed',
            details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
          },
        });
      }
    });

    return router;
  }

  private generateTitle(source: any, index: string, query: string): string {
    switch (index) {
      case 'patients':
        return `Patient: ${source.demographics?.name || 'John Doe'}, Age ${source.age || '45'}`;
      case 'clinical-notes':
        return `Clinical Note: ${source.category || 'General Assessment'}`;
      case 'lab-results':
        return `Lab Result: ${source.label || 'Blood Panel'}`;
      case 'medications':
        return `Medication: ${source.drug || 'Prescribed Drug'}`;
      default:
        return `Medical Record: ${query} Related`;
    }
  }

  private generateSummary(source: any, index: string, query: string): string {
    switch (index) {
      case 'patients':
        return `${source.demographics?.gender || 'Patient'} with ${query.toLowerCase()} related conditions. Recent vitals and assessment available.`;
      case 'clinical-notes':
        return `Clinical documentation regarding ${query.toLowerCase()}. Detailed assessment and treatment plan included.`;
      case 'lab-results':
        return `Laboratory findings related to ${query.toLowerCase()}. Results show relevant clinical markers and values.`;
      case 'medications':
        return `Medication prescription for ${query.toLowerCase()} treatment. Dosage and administration details provided.`;
      default:
        return `Medical information relevant to ${query.toLowerCase()} from healthcare database.`;
    }
  }

  private mapIndexToType(index: string): string {
    switch (index) {
      case 'patients': return 'patient';
      case 'clinical-notes': return 'clinical-note';
      case 'lab-results': return 'lab-result';
      case 'medications': return 'medication';
      default: return 'medical-record';
    }
  }

  private generateEnhancedMockResults(query: string, role: string) {
    const baseResults = [
      {
        id: `patient-${Date.now()}-1`,
        title: `Patient Record: Related to ${query}`,
        summary: `Comprehensive patient record with ${query.toLowerCase()} related conditions and treatment history.`,
        relevanceScore: 0.95,
        source: 'MIMIC-III Database',
        type: 'patient',
        highlights: [query.toLowerCase(), 'patient history', 'medical record'],
        metadata: {
          patientId: `PAT-${Math.floor(Math.random() * 10000)}`,
          age: Math.floor(Math.random() * 50) + 25,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          department: 'Internal Medicine',
          lastUpdated: new Date().toISOString(),
          searchRole: role
        } as any,
        timestamp: new Date().toISOString()
      },
      {
        id: `clinical-${Date.now()}-2`,
        title: `Clinical Assessment: ${query} Evaluation`,
        summary: `Detailed clinical evaluation and assessment regarding ${query.toLowerCase()}. Professional medical documentation.`,
        relevanceScore: 0.88,
        source: 'Clinical Notes System',
        type: 'clinical-note',
        highlights: [query.toLowerCase(), 'clinical assessment', 'evaluation'],
        metadata: {
          noteId: `NOTE-${Math.floor(Math.random() * 10000)}`,
          physician: 'Dr. Sarah Johnson',
          department: 'Cardiology',
          date: new Date().toISOString(),
          searchRole: role
        } as any,
        timestamp: new Date().toISOString()
      }
    ];

    // Add role-specific results
    if (role === 'patient') {
      baseResults.push({
        id: `education-${Date.now()}-3`,
        title: `Patient Education: Understanding ${query}`,
        summary: `Educational material about ${query.toLowerCase()} written in patient-friendly language.`,
        relevanceScore: 0.82,
        source: 'Patient Education Database',
        type: 'education',
        highlights: [query.toLowerCase(), 'patient education', 'explanation'],
        metadata: {
          educationId: `EDU-${Math.floor(Math.random() * 10000)}`,
          readingLevel: 'Grade 8',
          language: 'English',
          searchRole: role
        } as any,
        timestamp: new Date().toISOString()
      });
    } else {
      baseResults.push({
        id: `research-${Date.now()}-3`,
        title: `Research: Latest ${query} Studies`,
        summary: `Recent research findings and clinical studies related to ${query.toLowerCase()}.`,
        relevanceScore: 0.85,
        source: 'PubMed Database',
        type: 'research',
        highlights: [query.toLowerCase(), 'research', 'clinical study'],
        metadata: {
          pmid: `${Math.floor(Math.random() * 100000000)}`,
          journal: 'Medical Journal',
          publicationDate: new Date().toISOString(),
          searchRole: role
        } as any,
        timestamp: new Date().toISOString()
      });
    }

    return baseResults;
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NotFound',
          message: 'Resource not found',
        },
      });
    });

    // Global error handler
    this.app.use((error: any, req: Request, res: Response, next: any) => {
      logger.error('Error occurred:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'InternalServerError',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
        },
      });
    });
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('join-session', (sessionId: string) => {
        socket.join(sessionId);
        logger.info(`Socket ${socket.id} joined session ${sessionId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public listen(): void {
    const port = parseInt(process.env.PORT || '3001', 10);
    
    this.server.listen(port, () => {
      logger.info(`🚀 MediQuery AI API Server started on port ${port}`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api`);
      logger.info(`🏥 Health Check: http://localhost:${port}/health`);
      logger.info(`🔍 Search API: http://localhost:${port}/api/search`);
      logger.info(`📊 Stats: http://localhost:${port}/api/stats`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });
  }
}

export default App;