import { ClinicalNote } from '@/types/index.js';

export class ClinicalNoteModel {
  id: string;
  patientId: string;
  admissionId?: string;
  type: 'progress' | 'admission' | 'discharge' | 'consultation' | 'procedure';
  title: string;
  content: string;
  author: string;
  timestamp: string;
  department: string;
  tags: string[];
  relatedConditions: string[];

  constructor(data: Partial<ClinicalNote>) {
    this.id = data.id || '';
    this.patientId = data.patient_id || '';
    this.admissionId = data.admission_id;
    this.type = data.type || 'progress';
    this.title = data.title || '';
    this.content = data.content || '';
    this.author = data.author || '';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.department = data.department || '';
    this.tags = data.tags || [];
    this.relatedConditions = data.relatedConditions || [];
  }

  // Extract medical entities from content
  extractMedicalEntities(): {
    conditions: string[];
    medications: string[];
    procedures: string[];
    symptoms: string[];
  } {
    const content = this.content.toLowerCase();
    
    // Simple regex patterns for common medical terms
    const conditionPatterns = [
      /diabetes(?:\s+mellitus)?/g,
      /hypertension|high blood pressure/g,
      /myocardial infarction|heart attack|mi\b/g,
      /chronic obstructive pulmonary disease|copd/g,
      /congestive heart failure|chf/g,
      /pneumonia/g,
      /sepsis/g,
      /stroke|cerebrovascular accident|cva/g,
    ];

    const medicationPatterns = [
      /metformin/g,
      /insulin/g,
      /lisinopril/g,
      /atorvastatin/g,
      /aspirin/g,
      /furosemide/g,
      /warfarin/g,
      /prednisone/g,
    ];

    const procedurePatterns = [
      /ecg|electrocardiogram/g,
      /chest x-ray|cxr/g,
      /ct scan|computed tomography/g,
      /mri|magnetic resonance imaging/g,
      /blood test|lab work/g,
      /biopsy/g,
      /surgery|surgical procedure/g,
    ];

    const symptomPatterns = [
      /chest pain/g,
      /shortness of breath|dyspnea/g,
      /nausea/g,
      /vomiting/g,
      /fever/g,
      /headache/g,
      /fatigue/g,
      /dizziness/g,
    ];

    const extractMatches = (patterns: RegExp[]): string[] => {
      const matches = new Set<string>();
      patterns.forEach(pattern => {
        const found = content.match(pattern);
        if (found) {
          found.forEach(match => matches.add(match));
        }
      });
      return Array.from(matches);
    };

    return {
      conditions: extractMatches(conditionPatterns),
      medications: extractMatches(medicationPatterns),
      procedures: extractMatches(procedurePatterns),
      symptoms: extractMatches(symptomPatterns),
    };
  }

  // Generate summary for indexing
  generateSummary(): string {
    const maxLength = 200;
    const summary = this.content.length > maxLength 
      ? this.content.substring(0, maxLength) + '...'
      : this.content;
    
    return summary.replace(/\s+/g, ' ').trim();
  }

  // Get note severity based on content
  getSeverity(): 'low' | 'medium' | 'high' {
    const content = this.content.toLowerCase();
    
    const highSeverityTerms = [
      'critical', 'emergency', 'urgent', 'severe', 'acute',
      'cardiac arrest', 'respiratory failure', 'shock',
      'intensive care', 'icu', 'intubated'
    ];

    const mediumSeverityTerms = [
      'moderate', 'concerning', 'abnormal', 'elevated',
      'declined', 'worsened', 'unstable'
    ];

    if (highSeverityTerms.some(term => content.includes(term))) {
      return 'high';
    }

    if (mediumSeverityTerms.some(term => content.includes(term))) {
      return 'medium';
    }

    return 'low';
  }

  // Convert to Elasticsearch document
  toElasticsearchDocument(): any {
    const entities = this.extractMedicalEntities();
    
    return {
      id: this.id,
      patient_id: this.patientId,
      admission_id: this.admissionId,
      type: 'clinical-note',
      note_type: this.type,
      source: 'Clinical System',
      timestamp: this.timestamp,
      title: this.title,
      summary: this.generateSummary(),
      content: this.content,
      author: this.author,
      department: this.department,
      tags: this.tags,
      related_conditions: this.relatedConditions,
      severity: this.getSeverity(),
      extracted_entities: entities,
      searchable_text: this.generateSearchableText(),
      word_count: this.content.split(/\s+/).length,
      has_critical_terms: this.hasCriticalTerms(),
    };
  }

  // Generate searchable text
  private generateSearchableText(): string {
    const entities = this.extractMedicalEntities();
    
    return [
      this.title,
      this.content,
      this.author,
      this.department,
      ...this.tags,
      ...this.relatedConditions,
      ...entities.conditions,
      ...entities.medications,
      ...entities.procedures,
      ...entities.symptoms,
    ].join(' ');
  }

  // Check for critical terms
  private hasCriticalTerms(): boolean {
    const criticalTerms = [
      'emergency', 'critical', 'urgent', 'stat',
      'cardiac arrest', 'respiratory failure', 'septic shock',
      'massive bleeding', 'stroke', 'myocardial infarction'
    ];

    const content = this.content.toLowerCase();
    return criticalTerms.some(term => content.includes(term));
  }

  // Validate note data
  validate(): string[] {
    const errors: string[] = [];

    if (!this.id) {
      errors.push('Note ID is required');
    }

    if (!this.patientId) {
      errors.push('Patient ID is required');
    }

    if (!this.title) {
      errors.push('Note title is required');
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push('Note content is required');
    }

    if (!this.author) {
      errors.push('Note author is required');
    }

    if (!this.department) {
      errors.push('Department is required');
    }

    if (this.content && this.content.length > 10000) {
      errors.push('Note content exceeds maximum length of 10,000 characters');
    }

    return errors;
  }

  // Update note content
  update(updates: Partial<ClinicalNote>): void {
    Object.assign(this, updates);
  }

  // Add tag
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  // Remove tag
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  // Add related condition
  addRelatedCondition(condition: string): void {
    if (!this.relatedConditions.includes(condition)) {
      this.relatedConditions.push(condition);
    }
  }

  // Check if note mentions specific term
  mentionsTerm(term: string): boolean {
    return this.content.toLowerCase().includes(term.toLowerCase());
  }

  // Get note age in days
  getAgeInDays(): number {
    const noteDate = new Date(this.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - noteDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if note is recent (within last 30 days)
  isRecent(): boolean {
    return this.getAgeInDays() <= 30;
  }
}

export default ClinicalNoteModel;