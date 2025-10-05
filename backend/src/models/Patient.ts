import { 
  Patient, 
  PatientDemographics, 
  MedicalCondition, 
  Medication, 
  LabResult, 
  ClinicalNote, 
  Admission, 
  TimelineEvent 
} from '@/types/index.js';

export class PatientModel {
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

  constructor(data: Partial<Patient>) {
    this.id = data.id || '';
    this.demographics = data.demographics || {} as PatientDemographics;
    this.conditions = data.conditions || [];
    this.medications = data.medications || [];
    this.labResults = data.labResults || [];
    this.clinicalNotes = data.clinicalNotes || [];
    this.admissions = data.admissions || [];
    this.timeline = data.timeline || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Calculate patient age
  getAge(): number | null {
    if (!this.demographics.dateOfBirth) return null;
    
    const birthDate = new Date(this.demographics.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Get active conditions
  getActiveConditions(): MedicalCondition[] {
    return this.conditions.filter(condition => condition.status === 'active');
  }

  // Get current medications
  getCurrentMedications(): Medication[] {
    return this.medications.filter(med => med.status === 'active');
  }

  // Get recent lab results (within last 6 months)
  getRecentLabResults(monthsBack: number = 6): LabResult[] {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
    
    return this.labResults
      .filter(lab => new Date(lab.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get latest admission
  getLatestAdmission(): Admission | null {
    if (this.admissions.length === 0) return null;
    
    return this.admissions
      .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())[0];
  }

  // Check if patient has specific condition
  hasCondition(conditionCode: string): boolean {
    return this.conditions.some(condition => 
      condition.code === conditionCode && condition.status === 'active'
    );
  }

  // Get timeline events for specific period
  getTimelineEvents(startDate?: Date, endDate?: Date): TimelineEvent[] {
    let events = [...this.timeline];
    
    if (startDate) {
      events = events.filter(event => new Date(event.timestamp) >= startDate);
    }
    
    if (endDate) {
      events = events.filter(event => new Date(event.timestamp) <= endDate);
    }
    
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Generate summary for search indexing
  generateSearchSummary(): string {
    const age = this.getAge();
    const gender = this.demographics.gender || 'Unknown';
    const activeConditions = this.getActiveConditions().map(c => c.description).slice(0, 3);
    const currentMeds = this.getCurrentMedications().map(m => m.name).slice(0, 3);
    
    let summary = `${age ? `${age}-year-old` : ''} ${gender.toLowerCase()} patient`;
    
    if (activeConditions.length > 0) {
      summary += ` with ${activeConditions.join(', ')}`;
    }
    
    if (currentMeds.length > 0) {
      summary += `. Current medications: ${currentMeds.join(', ')}`;
    }
    
    return summary;
  }

  // Convert to Elasticsearch document
  toElasticsearchDocument(): any {
    return {
      id: this.id,
      type: 'patient',
      source: 'MediQuery',
      timestamp: new Date().toISOString(),
      title: `Patient ${this.id} - ${this.demographics.gender || 'Unknown'}`,
      summary: this.generateSearchSummary(),
      demographics: this.demographics,
      conditions: this.conditions,
      medications: this.medications,
      admissions_count: this.admissions.length,
      active_conditions_count: this.getActiveConditions().length,
      current_medications_count: this.getCurrentMedications().length,
      age: this.getAge(),
      latest_admission_date: this.getLatestAdmission()?.admissionDate,
      searchable_text: this.generateSearchableText(),
    };
  }

  // Generate searchable text for full-text search
  private generateSearchableText(): string {
    const parts = [
      this.generateSearchSummary(),
      ...this.conditions.map(c => `${c.description} ${c.code}`),
      ...this.medications.map(m => `${m.name} ${m.genericName || ''}`),
      ...this.clinicalNotes.map(n => n.content.substring(0, 500)),
      this.demographics.race || '',
      this.demographics.ethnicity || '',
    ];
    
    return parts.filter(Boolean).join(' ');
  }

  // Validate required fields
  validate(): string[] {
    const errors: string[] = [];
    
    if (!this.id) {
      errors.push('Patient ID is required');
    }
    
    if (!this.demographics.gender) {
      errors.push('Patient gender is required');
    }
    
    if (!this.demographics.dateOfBirth) {
      errors.push('Patient date of birth is required');
    }
    
    // Validate conditions
    this.conditions.forEach((condition, index) => {
      if (!condition.code) {
        errors.push(`Condition ${index + 1}: code is required`);
      }
      if (!condition.description) {
        errors.push(`Condition ${index + 1}: description is required`);
      }
    });
    
    // Validate medications
    this.medications.forEach((medication, index) => {
      if (!medication.name) {
        errors.push(`Medication ${index + 1}: name is required`);
      }
      if (!medication.dosage) {
        errors.push(`Medication ${index + 1}: dosage is required`);
      }
    });
    
    return errors;
  }

  // Update patient data
  update(updates: Partial<Patient>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  // Add new condition
  addCondition(condition: MedicalCondition): void {
    this.conditions.push(condition);
    this.updatedAt = new Date();
  }

  // Add new medication
  addMedication(medication: Medication): void {
    this.medications.push(medication);
    this.updatedAt = new Date();
  }

  // Add lab result
  addLabResult(labResult: LabResult): void {
    this.labResults.push(labResult);
    this.updatedAt = new Date();
  }

  // Add clinical note
  addClinicalNote(note: ClinicalNote): void {
    this.clinicalNotes.push(note);
    this.updatedAt = new Date();
  }

  // Add timeline event
  addTimelineEvent(event: TimelineEvent): void {
    this.timeline.push(event);
    this.timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.updatedAt = new Date();
  }
}

export default PatientModel;