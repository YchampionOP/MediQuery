import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.ELASTICSEARCH_NODE = 'http://localhost:9200';
process.env.JWT_SECRET = 'test-secret';

// Global test timeout
jest.setTimeout(30000);

// Mock external services
jest.mock('../services/elasticsearch', () => ({
  elasticsearchService: {
    search: jest.fn(),
    getDocument: jest.fn(),
    indexDocument: jest.fn(),
    deleteDocument: jest.fn(),
    createIndex: jest.fn(),
    testConnection: jest.fn().mockResolvedValue(true)
  }
}));

// Suppress console logs during testing unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

export {};