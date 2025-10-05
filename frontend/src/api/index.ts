import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  SearchQuery, 
  SearchResponse, 
  AuthRequest, 
  AuthResponse,
  ApiResponse 
} from '@types/index';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.client.post(
      '/auth/login',
      credentials
    );
    
    if (response.data.success && response.data.data) {
      // Store token and user info
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('userRole', response.data.data.user.role);
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Login failed');
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.client.post(
        '/auth/verify'
      );
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async getDemoUsers(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.client.get(
      '/auth/demo-users'
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  }

  // Search
  async search(query: SearchQuery): Promise<SearchResponse> {
    const response: AxiosResponse<ApiResponse<SearchResponse>> = await this.client.post(
      '/search',
      query
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Search failed');
  }

  async getSearchSuggestions(query?: string, role?: string): Promise<string[]> {
    const response: AxiosResponse<ApiResponse<{ suggestions: string[] }>> = await this.client.get(
      '/search/suggestions',
      { params: { query, role } }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data.suggestions;
    }
    
    return [];
  }

  // Patient data
  async getPatient(id: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get(
      `/patient/${id}`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error?.message || 'Failed to fetch patient data');
  }

  async getPatientTimeline(id: string): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.client.get(
      `/patient/${id}/timeline`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  }

  // Medical codes and references
  async searchMedicalCodes(query: string, codeSystem?: string): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.client.get(
      '/medical/codes',
      { params: { query, codeSystem } }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  }

  async checkDrugInteractions(medications: string[]): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.client.post(
      '/medical/drug-interactions',
      { medications }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  }

  // Export functionality
  async exportData(exportRequest: any): Promise<Blob> {
    const response = await this.client.post(
      '/export/pdf',
      exportRequest,
      { responseType: 'blob' }
    );
    
    return response.data;
  }

  // Health check
  async getHealth(): Promise<any> {
    const response = await axios.get('/health');
    return response.data;
  }

  // Utility method for handling API errors
  private handleError(error: any): never {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;