import { LabResult } from '@/types/index.js';

export class LabResultModel {
  id: string;
  patientId: string;
  admissionId?: string;
  testName: string;
  value: number | string;
  unit: string;
  referenceRange?: string;
  status: 'normal' | 'abnormal' | 'critical';
  timestamp: string;
  orderingProvider: string;
  category: string;
  flags: string[];

  constructor(data: Partial<LabResult>) {
    this.id = data.id || '';
    this.patientId = data.patient_id || '';
    this.admissionId = data.admission_id;
    this.testName = data.testName || '';
    this.value = data.value || '';
    this.unit = data.unit || '';
    this.referenceRange = data.referenceRange;
    this.status = data.status || 'normal';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.orderingProvider = data.orderingProvider || '';
    this.category = data.category || '';
    this.flags = data.flags || [];
  }

  // Determine if result is numeric
  isNumeric(): boolean {
    return typeof this.value === 'number' || !isNaN(Number(this.value));
  }

  // Get numeric value
  getNumericValue(): number | null {
    if (typeof this.value === 'number') {
      return this.value;
    }
    
    const numValue = Number(this.value);
    return isNaN(numValue) ? null : numValue;
  }

  // Parse reference range
  parseReferenceRange(): { min?: number; max?: number; text: string } {
    if (!this.referenceRange) {
      return { text: '' };
    }

    const range = this.referenceRange.toLowerCase();
    
    // Pattern: "10-20 mg/dL" or "< 5.0" or "> 100" etc.
    const rangePattern = /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/;
    const lessThanPattern = /[<≤]\s*(\d+\.?\d*)/;
    const greaterThanPattern = /[>≥]\s*(\d+\.?\d*)/;
    
    const rangeMatch = range.match(rangePattern);
    if (rangeMatch) {
      return {
        min: parseFloat(rangeMatch[1]),
        max: parseFloat(rangeMatch[2]),
        text: this.referenceRange
      };
    }

    const lessThanMatch = range.match(lessThanPattern);
    if (lessThanMatch) {
      return {
        max: parseFloat(lessThanMatch[1]),
        text: this.referenceRange
      };
    }

    const greaterThanMatch = range.match(greaterThanPattern);
    if (greaterThanMatch) {
      return {
        min: parseFloat(greaterThanMatch[1]),
        text: this.referenceRange
      };
    }

    return { text: this.referenceRange };
  }

  // Determine status based on reference range
  calculateStatus(): 'normal' | 'abnormal' | 'critical' {
    if (!this.isNumeric() || !this.referenceRange) {
      return this.status; // Return current status if can't calculate
    }

    const numValue = this.getNumericValue();
    if (numValue === null) return this.status;

    const range = this.parseReferenceRange();
    
    let isAbnormal = false;
    
    if (range.min !== undefined && numValue < range.min) {
      isAbnormal = true;
    }
    
    if (range.max !== undefined && numValue > range.max) {
      isAbnormal = true;
    }

    if (!isAbnormal) {
      return 'normal';
    }

    // Check for critical values
    return this.isCriticalValue(numValue) ? 'critical' : 'abnormal';
  }

  // Check if value is critical based on test type
  private isCriticalValue(value: number): boolean {
    const testName = this.testName.toLowerCase();
    
    // Critical values for common lab tests
    const criticalRanges: Record<string, { min?: number; max?: number }> = {
      'glucose': { min: 40, max: 400 },
      'potassium': { min: 2.5, max: 6.0 },
      'sodium': { min: 120, max: 160 },
      'creatinine': { max: 5.0 },
      'hemoglobin': { min: 7.0, max: 20.0 },
      'platelets': { min: 50, max: 1000 },
      'white blood cell': { min: 2.0, max: 30.0 },
      'troponin': { max: 0.4 },
      'inr': { max: 5.0 },
      'pt': { max: 100 },
      'ptt': { max: 100 },
    };

    for (const [test, range] of Object.entries(criticalRanges)) {
      if (testName.includes(test)) {
        if (range.min !== undefined && value < range.min) return true;
        if (range.max !== undefined && value > range.max) return true;
      }
    }

    return false;
  }

  // Get trend compared to previous results
  getTrend(previousResults: LabResultModel[]): 'improving' | 'worsening' | 'stable' | 'unknown' {
    if (!this.isNumeric() || previousResults.length === 0) {
      return 'unknown';
    }

    // Find most recent previous result for same test
    const sameTestResults = previousResults
      .filter(result => result.testName === this.testName && result.isNumeric())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (sameTestResults.length === 0) {
      return 'unknown';
    }

    const currentValue = this.getNumericValue()!;
    const previousValue = sameTestResults[0].getNumericValue()!;
    
    const percentChange = Math.abs((currentValue - previousValue) / previousValue) * 100;
    
    // If change is less than 5%, consider it stable
    if (percentChange < 5) {
      return 'stable';
    }

    // Determine if increase is good or bad based on test type
    const isIncreaseGood = this.isIncreasePositive();
    
    if (currentValue > previousValue) {
      return isIncreaseGood ? 'improving' : 'worsening';
    } else {
      return isIncreaseGood ? 'worsening' : 'improving';
    }
  }

  // Determine if increase in value is positive for this test
  private isIncreasePositive(): boolean {
    const testName = this.testName.toLowerCase();
    
    // Tests where higher values are generally better
    const higherIsBetter = [
      'hemoglobin', 'hematocrit', 'albumin', 'protein',
      'hdl', 'egfr'
    ];

    // Tests where lower values are generally better
    const lowerIsBetter = [
      'glucose', 'cholesterol', 'ldl', 'triglycerides',
      'creatinine', 'bun', 'urea', 'troponin',
      'c-reactive protein', 'crp', 'esr'
    ];

    if (higherIsBetter.some(test => testName.includes(test))) {
      return true;
    }

    if (lowerIsBetter.some(test => testName.includes(test))) {
      return false;
    }

    // Default: assume lower is better
    return false;
  }

  // Generate interpretive comment
  generateInterpretation(): string {
    const status = this.calculateStatus();
    const value = this.value;
    const range = this.referenceRange;
    
    switch (status) {
      case 'critical':
        return `CRITICAL: ${this.testName} is ${value} ${this.unit}, which is critically ${this.isNumeric() && this.getNumericValue()! > this.parseReferenceRange().max! ? 'high' : 'low'}.`;
      
      case 'abnormal':
        if (this.isNumeric() && range) {
          const parsedRange = this.parseReferenceRange();
          const numValue = this.getNumericValue()!;
          
          if (parsedRange.max !== undefined && numValue > parsedRange.max) {
            return `${this.testName} is elevated at ${value} ${this.unit} (normal: ${range}).`;
          } else if (parsedRange.min !== undefined && numValue < parsedRange.min) {
            return `${this.testName} is low at ${value} ${this.unit} (normal: ${range}).`;
          }
        }
        return `${this.testName} is ${value} ${this.unit}, which is outside the normal range.`;
      
      case 'normal':
      default:
        return `${this.testName} is ${value} ${this.unit}, which is within the normal range.`;
    }
  }

  // Convert to Elasticsearch document
  toElasticsearchDocument(): any {
    const interpretation = this.generateInterpretation();
    const calculatedStatus = this.calculateStatus();
    
    return {
      id: this.id,
      patient_id: this.patientId,
      admission_id: this.admissionId,
      type: 'lab-result',
      source: 'Laboratory System',
      timestamp: this.timestamp,
      title: `${this.testName}: ${this.value} ${this.unit}`,
      summary: interpretation,
      test_name: this.testName,
      value: this.value,
      numeric_value: this.getNumericValue(),
      unit: this.unit,
      reference_range: this.referenceRange,
      status: calculatedStatus,
      ordering_provider: this.orderingProvider,
      category: this.category,
      flags: this.flags,
      is_numeric: this.isNumeric(),
      is_critical: calculatedStatus === 'critical',
      is_abnormal: calculatedStatus !== 'normal',
      interpretation: interpretation,
      age_in_days: this.getAgeInDays(),
      searchable_text: this.generateSearchableText(),
    };
  }

  // Generate searchable text
  private generateSearchableText(): string {
    return [
      this.testName,
      this.value.toString(),
      this.unit,
      this.category,
      this.orderingProvider,
      this.generateInterpretation(),
      ...this.flags,
    ].join(' ');
  }

  // Get age of result in days
  getAgeInDays(): number {
    const resultDate = new Date(this.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - resultDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if result is recent
  isRecent(days: number = 30): boolean {
    return this.getAgeInDays() <= days;
  }

  // Validate lab result
  validate(): string[] {
    const errors: string[] = [];

    if (!this.id) {
      errors.push('Lab result ID is required');
    }

    if (!this.patientId) {
      errors.push('Patient ID is required');
    }

    if (!this.testName) {
      errors.push('Test name is required');
    }

    if (this.value === '' || this.value === null || this.value === undefined) {
      errors.push('Lab value is required');
    }

    if (!this.orderingProvider) {
      errors.push('Ordering provider is required');
    }

    if (!this.category) {
      errors.push('Lab category is required');
    }

    return errors;
  }

  // Update result
  update(updates: Partial<LabResult>): void {
    Object.assign(this, updates);
  }

  // Add flag
  addFlag(flag: string): void {
    if (!this.flags.includes(flag)) {
      this.flags.push(flag);
    }
  }

  // Remove flag
  removeFlag(flag: string): void {
    this.flags = this.flags.filter(f => f !== flag);
  }
}

export default LabResultModel;