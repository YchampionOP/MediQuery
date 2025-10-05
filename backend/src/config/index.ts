import dotenv from 'dotenv';

dotenv.config();

interface Config {
  env: string;
  server: {
    port: number;
  };
  frontend: {
    url: string;
  };
  elasticsearch: {
    node: string;
    apiKey?: string;
    username?: string;
    password?: string;
  };
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  logging: {
    level: string;
    file: string;
  };
  data: {
    mimicPath: string;
    syntheaPath: string;
    batchSize: number;
  };
  ai: {
    modelPath: string;
    embeddingsPath: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    apiKey: process.env.ELASTICSEARCH_API_KEY,
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '24h',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/mediquery.log',
  },
  
  data: {
    mimicPath: process.env.MIMIC_DATA_PATH || './mimic-iii-clinical-database-demo-1.4',
    syntheaPath: process.env.SYNTHEA_DATA_PATH || './synthea-master/output',
    batchSize: parseInt(process.env.BATCH_SIZE || '1000', 10),
  },
  
  ai: {
    modelPath: process.env.LLM_MODEL_PATH || './ai-models/medical-llm',
    embeddingsPath: process.env.EMBEDDINGS_MODEL_PATH || './ai-models/medical-embeddings',
  },
};