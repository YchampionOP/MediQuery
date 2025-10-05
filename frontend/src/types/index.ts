// User role types
export type UserRole = 'clinician' | 'patient';

// User interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string; // For clinicians
  licenseNumber?: string; // For clinicians
  dateOfBirth?: string; // For patients
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

// Search and query types
export interface SearchQuery {
  query: string;
  userRole: UserRole;
  filters?: SearchFilters;
  searchType?: 'hybrid' | 'semantic' | 'keyword';
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
}

export type ResultType = 'patient' | 'clinical-note' | 'lab-result' | 'medication' | 'research';

// Search results
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
  conversationalResponse: string;
  aggregations?: Record<string, any>;
}

// Tool call interface
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
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
  code: string; // ICD-10 code
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
  code: string; // CPT code
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

// Chat and conversation types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  searchResults?: SearchResult[];
  suggestions?: string[];
  toolCalls?: ToolCall[];
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
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

// Visualization and analytics types
export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  normal: boolean;
  referenceRange?: string;
}

// Export and report types
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

// Error types
export interface AppError {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  context?: Record<string, any>;
}