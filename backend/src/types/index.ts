// Base types
export type UserRole = 'clinician' | 'patient';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

// Authentication types
export interface AuthRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: string;
}

// Search types
export interface SearchQuery {
  query: string;
  userRole: UserRole;
  userId?: string;
  filters?: SearchFilters;
  searchType?: 'hybrid' | 'semantic' | 'keyword';
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  patientDemographics?: {
    ageRange?: [number, number];
    gender?: string;
    conditions?: string[];
  };
  medicalCodes?: string[];
  departments?: string[];
  resultTypes?: ResultType[];
  severity?: string[];
}

export type ResultType = 'patient' | 'clinical-note' | 'lab-result' | 'medication' | 'research';

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  relevanceScore: number;
  source: string;
  type: ResultType;
  highlights: string[];
  metadata: Record<string, any>;
  timestamp: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  queryTime: number;
  suggestions: string[];
  conversationalResponse?: string;
  aggregations?: Record<string, any>;
  pagination: {
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

// Medical data types
export interface Patient {
  id: string;
  demographics: PatientDemographics;
  conditions: MedicalCondition[];
  medications: Medication[];
  labResults: LabResult[];
  clinicalNotes: ClinicalNote[];
  admissions: Admission[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDemographics {
  dateOfBirth: string;
  gender: string;
  race?: string;
  ethnicity?: string;
  maritalStatus?: string;
  language?: string;
  insurance?: string;
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface MedicalCondition {
  id: string;
  code: string;
  codeSystem: 'ICD-10' | 'SNOMED-CT';
  description: string;
  severity?: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'inactive';
  onsetDate?: string;
  resolvedDate?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'completed';
  prescribingProvider: string;
  interactions?: DrugInteraction[];
  sideEffects?: string[];
}

export interface DrugInteraction {
  drugName: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  recommendation: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: number | string;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'abnormal' | 'critical';
  timestamp: string;
  orderingProvider: string;
  category: string;
  flags?: string[];
}

export interface ClinicalNote {
  id: string;
  type: 'progress' | 'admission' | 'discharge' | 'consultation' | 'procedure';
  title: string;
  content: string;
  author: string;
  timestamp: string;
  department: string;
  tags?: string[];
  relatedConditions?: string[];
}

export interface Admission {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  department: string;
  admissionType: 'emergency' | 'elective' | 'urgent';
  primaryDiagnosis: string;
  secondaryDiagnoses?: string[];
  procedures?: Procedure[];
  attendingPhysician: string;
  disposition?: string;
}

export interface Procedure {
  id: string;
  code: string;
  description: string;
  date: string;
  provider: string;
  duration?: number;
  complications?: string[];
  outcome?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'admission' | 'diagnosis' | 'medication' | 'lab' | 'procedure' | 'note';
  title: string;
  description: string;
  timestamp: string;
  category: string;
  significance: 'low' | 'medium' | 'high';
  relatedItems?: string[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;
}

// Elasticsearch types
export interface ElasticsearchQuery {
  index: string;
  body: any;
  size?: number;
  from?: number;
}

export interface ElasticsearchResponse {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: Array<{
      _index: string;
      _id: string;
      _score: number;
      _source: any;
      highlight?: Record<string, string[]>;
    }>;
  };
  aggregations?: Record<string, any>;
  took: number;
}

// Medical ontology types
export interface MedicalCode {
  code: string;
  system: 'ICD-10' | 'SNOMED-CT' | 'CPT';
  display: string;
  definition?: string;
  children?: MedicalCode[];
  parent?: string;
}

// Export types
export interface ExportRequest {
  format: 'pdf' | 'csv' | 'json';
  data: any;
  template?: string;
  options?: {
    includeCharts: boolean;
    includeTimeline: boolean;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

// Socket types
export interface SocketMessage {
  type: string;
  data: any;
  timestamp: string;
  sessionId: string;
}