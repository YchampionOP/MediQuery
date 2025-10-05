import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface SearchFilters {
  documentType?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  department?: string[];
  priority?: string[];
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: string;
}

export interface SearchRequest {
  query: string;
  role: 'clinician' | 'patient';
  filters?: SearchFilters;
  indices?: string[];
  size?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  relevanceScore: number;
  source: string;
  type: 'patient' | 'clinical-note' | 'lab-result' | 'medication' | 'research';
  highlights: string[];
  metadata: any;
  timestamp: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  took: number;
  suggestions?: string[];
  queryProcessing?: {
    originalQuery: string;
    processedQuery: string;
    entities: any[];
    intent: any;
    confidence: number;
  };
}

export const searchService = {
  // Main search endpoint
  async search(request: SearchRequest): Promise<SearchResponse> {
    const response = await api.post('/search', request);
    return response.data.data;
  },

  // Similar patients search
  async findSimilarPatients(patientId: string, similarityFields?: string[]): Promise<any> {
    const response = await api.post('/search/similar-patients', {
      patientId,
      similarityFields,
    });
    return response.data.data;
  },

  // Advanced search with custom parameters
  async advancedSearch(params: any): Promise<SearchResponse> {
    const response = await api.post('/search/advanced', params);
    return response.data.data;
  },

  // Get search suggestions
  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      return response.data.suggestions || [];
    } catch (error) {
      console.warn('Failed to get suggestions:', error);
      return [];
    }
  },
};

export const exportService = {
  // Export patient record as PDF
  async exportPatientAsPDF(patientId: string): Promise<any> {
    const response = await api.post(`/export/pdf/patients/${patientId}`);
    return response.data;
  },

  // Export clinical note as PDF
  async exportClinicalNoteAsPDF(noteId: string): Promise<any> {
    const response = await api.post(`/export/pdf/clinical-notes/${noteId}`);
    return response.data;
  },

  // Export lab result as PDF
  async exportLabResultAsPDF(labId: string): Promise<any> {
    const response = await api.post(`/export/pdf/lab-results/${labId}`);
    return response.data;
  },

  // Export medication as PDF
  async exportMedicationAsPDF(medId: string): Promise<any> {
    const response = await api.post(`/export/pdf/medications/${medId}`);
    return response.data;
  },

  // Generic export
  async exportAsPDF(index: string, id: string): Promise<any> {
    const response = await api.post(`/export/pdf/${index}/${id}`);
    return response.data;
  },
};

export const healthService = {
  // Check backend health
  async checkHealth(): Promise<any> {
    // Health endpoint is at root, not under /api
    const response = await axios.get('http://localhost:3001/health');
    return response.data;
  },

  // Get system statistics
  async getStats(): Promise<any> {
    const response = await api.get('/api/stats');
    return response.data;
  },
};

export interface MedicalCode {
  id: string;
  code: string;
  codeSystem: string;
  description: string;
  longDescription?: string;
  category?: string;
  parentId?: string;
  children?: MedicalCode[];
}

export interface MedicalCodesResponse {
  codes: MedicalCode[];
  total: number;
  took: number;
}

export interface MedicalCodeSearchFilters {
  codeSystem?: string;
  category?: string;
}

export interface MedicalCodeSearchRequest {
  query?: string;
  filters?: MedicalCodeSearchFilters;
  limit?: number;
  offset?: number;
}

export const medicalService = {
  // Get all medical codes with optional filtering
  async getMedicalCodes(type?: string, query?: string, limit: number = 100): Promise<MedicalCodesResponse> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (query) params.append('query', query);
    params.append('limit', limit.toString());
    
    const response = await api.get(`/medical/codes?${params.toString()}`);
    return response.data.data;
  },

  // Get specific medical code by ID
  async getMedicalCodeById(id: string): Promise<MedicalCode> {
    const response = await api.get(`/medical/codes/${id}`);
    return response.data.data.code;
  },

  // Get medical codes by type (ICD-10, SNOMED-CT, CPT)
  async getMedicalCodesByType(type: string, limit: number = 100): Promise<MedicalCodesResponse> {
    const response = await api.get(`/medical/codes/type/${type}?limit=${limit}`);
    return response.data.data;
  },

  // Search for medical codes with advanced filtering
  async searchMedicalCodes(request: MedicalCodeSearchRequest): Promise<MedicalCodesResponse> {
    const response = await api.post('/medical/codes/search', request);
    return response.data.data;
  },
};

export default api;