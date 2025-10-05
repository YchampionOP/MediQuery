import { Medication, DrugInteraction } from '@/types/index.js';

export class MedicationModel {
  id: string;
  patientId: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'completed';
  prescribingProvider: string;
  interactions: DrugInteraction[];
  sideEffects: string[];

  constructor(data: Partial<Medication>) {
    this.id = data.id || '';
    this.patientId = data.patient_id || '';
    this.name = data.name || '';
    this.genericName = data.genericName;
    this.dosage = data.dosage || '';
    this.frequency = data.frequency || '';
    this.route = data.route || '';
    this.startDate = data.startDate || new Date().toISOString();
    this.endDate = data.endDate;
    this.status = data.status || 'active';
    this.prescribingProvider = data.prescribingProvider || '';
    this.interactions = data.interactions || [];
    this.sideEffects = data.sideEffects || [];
  }

  // Get duration of medication use
  getDurationInDays(): number {
    const startDate = new Date(this.startDate);
    const endDate = this.endDate ? new Date(this.endDate) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if medication is currently active
  isCurrentlyActive(): boolean {
    if (this.status !== 'active') return false;
    
    if (this.endDate) {
      return new Date(this.endDate) > new Date();
    }
    
    return true;
  }

  // Parse dosage information
  parseDosage(): {
    amount?: number;
    unit?: string;
    strength?: string;
    form?: string;
  } {
    const dosage = this.dosage.toLowerCase();
    
    // Common patterns: "500mg", "10 mg", "1 tablet", "5ml"
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(mg|g|ml|l|units?|tablets?|capsules?|drops?)/,
      /(\d+(?:\.\d+)?)\s*([a-z]+)/,
    ];

    for (const pattern of patterns) {
      const match = dosage.match(pattern);
      if (match) {
        return {
          amount: parseFloat(match[1]),
          unit: match[2],
          strength: this.dosage,
        };
      }
    }

    return { strength: this.dosage };
  }

  // Parse frequency for daily dosing calculation
  parseFrequency(): {
    timesPerDay?: number;
    interval?: string;
    description: string;
  } {
    const freq = this.frequency.toLowerCase();
    
    const patterns = [
      { pattern: /once\s+daily|qd|q24h|daily/i, timesPerDay: 1 },
      { pattern: /twice\s+daily|bid|q12h/i, timesPerDay: 2 },
      { pattern: /three\s+times\s+daily|tid|q8h/i, timesPerDay: 3 },
      { pattern: /four\s+times\s+daily|qid|q6h/i, timesPerDay: 4 },
      { pattern: /every\s+(\d+)\s+hours?|q(\d+)h/i, timesPerDay: null }, // Will calculate
      { pattern: /as\s+needed|prn/i, timesPerDay: 0 },
      { pattern: /weekly|once\s+a\s+week/i, timesPerDay: 1/7 },
    ];

    for (const { pattern, timesPerDay } of patterns) {
      const match = freq.match(pattern);
      if (match) {
        if (pattern.source.includes('every') && match[1]) {
          const hours = parseInt(match[1]);
          return {
            timesPerDay: 24 / hours,
            interval: `Every ${hours} hours`,
            description: this.frequency
          };
        } else if (pattern.source.includes('every') && match[2]) {
          const hours = parseInt(match[2]);
          return {
            timesPerDay: 24 / hours,
            interval: `Every ${hours} hours`,
            description: this.frequency
          };
        }
        
        return {
          timesPerDay: timesPerDay || undefined,
          description: this.frequency
        };
      }
    }

    return { description: this.frequency };
  }

  // Calculate daily dose amount
  calculateDailyDose(): number | null {
    const dosage = this.parseDosage();
    const frequency = this.parseFrequency();
    
    if (dosage.amount && frequency.timesPerDay) {
      return dosage.amount * frequency.timesPerDay;
    }
    
    return null;
  }

  // Get medication class/category
  getMedicationClass(): string {
    const name = (this.genericName || this.name).toLowerCase();
    
    const classes: Record<string, string> = {
      // Diabetes medications
      'metformin': 'Antidiabetic (Biguanide)',
      'insulin': 'Antidiabetic (Insulin)',
      'glipizide': 'Antidiabetic (Sulfonylurea)',
      'pioglitazone': 'Antidiabetic (Thiazolidinedione)',
      
      // Cardiovascular medications
      'lisinopril': 'ACE Inhibitor',
      'losartan': 'ARB (Angiotensin Receptor Blocker)',
      'atorvastatin': 'Statin',
      'metoprolol': 'Beta Blocker',
      'amlodipine': 'Calcium Channel Blocker',
      'furosemide': 'Diuretic (Loop)',
      'hydrochlorothiazide': 'Diuretic (Thiazide)',
      'warfarin': 'Anticoagulant',
      'aspirin': 'Antiplatelet',
      
      // Antibiotics
      'amoxicillin': 'Antibiotic (Penicillin)',
      'azithromycin': 'Antibiotic (Macrolide)',
      'ciprofloxacin': 'Antibiotic (Fluoroquinolone)',
      
      // Pain medications
      'acetaminophen': 'Analgesic (Non-opioid)',
      'ibuprofen': 'NSAID',
      'naproxen': 'NSAID',
      'morphine': 'Opioid Analgesic',
      
      // Mental health
      'sertraline': 'Antidepressant (SSRI)',
      'fluoxetine': 'Antidepressant (SSRI)',
      'lorazepam': 'Benzodiazepine',
    };

    for (const [drug, drugClass] of Object.entries(classes)) {
      if (name.includes(drug)) {
        return drugClass;
      }
    }

    return 'Unknown';
  }

  // Check for high-risk medications
  isHighRisk(): boolean {
    const name = (this.genericName || this.name).toLowerCase();
    
    const highRiskMeds = [
      'warfarin', 'heparin', 'insulin', 'morphine', 'fentanyl',
      'digoxin', 'lithium', 'methotrexate', 'cyclophosphamide'
    ];

    return highRiskMeds.some(med => name.includes(med));
  }

  // Get common side effects for the medication
  getCommonSideEffects(): string[] {
    const name = (this.genericName || this.name).toLowerCase();
    
    const commonSideEffects: Record<string, string[]> = {
      'metformin': ['nausea', 'diarrhea', 'stomach upset', 'metallic taste'],
      'lisinopril': ['dry cough', 'dizziness', 'headache', 'fatigue'],
      'atorvastatin': ['muscle pain', 'headache', 'nausea', 'diarrhea'],
      'aspirin': ['stomach irritation', 'bleeding risk', 'ringing in ears'],
      'ibuprofen': ['stomach upset', 'kidney problems', 'blood pressure increase'],
      'sertraline': ['nausea', 'headache', 'dizziness', 'sleep changes'],
    };

    for (const [drug, effects] of Object.entries(commonSideEffects)) {
      if (name.includes(drug)) {
        return effects;
      }
    }

    return [];
  }

  // Check for potential drug interactions
  checkInteraction(otherMedication: MedicationModel): DrugInteraction | null {
    const drug1 = (this.genericName || this.name).toLowerCase();
    const drug2 = (otherMedication.genericName || otherMedication.name).toLowerCase();
    
    // Common drug interactions
    const interactions: Array<{
      drugs: [string, string];
      severity: 'minor' | 'moderate' | 'major';
      description: string;
      recommendation: string;
    }> = [
      {
        drugs: ['warfarin', 'aspirin'],
        severity: 'major',
        description: 'Increased bleeding risk',
        recommendation: 'Monitor INR closely and watch for signs of bleeding'
      },
      {
        drugs: ['lisinopril', 'potassium'],
        severity: 'moderate',
        description: 'Risk of hyperkalemia',
        recommendation: 'Monitor potassium levels regularly'
      },
      {
        drugs: ['metformin', 'iodinated contrast'],
        severity: 'major',
        description: 'Risk of lactic acidosis',
        recommendation: 'Hold metformin before and after contrast procedures'
      },
    ];

    for (const interaction of interactions) {
      const [interactDrug1, interactDrug2] = interaction.drugs;
      
      if ((drug1.includes(interactDrug1) && drug2.includes(interactDrug2)) ||
          (drug1.includes(interactDrug2) && drug2.includes(interactDrug1))) {
        return {
          drugName: otherMedication.name,
          severity: interaction.severity,
          description: interaction.description,
          recommendation: interaction.recommendation,
        };
      }
    }

    return null;
  }

  // Generate medication summary
  generateSummary(): string {
    const dosageInfo = this.parseDosage();
    const frequencyInfo = this.parseFrequency();
    const dailyDose = this.calculateDailyDose();
    
    let summary = `${this.name}`;
    
    if (this.genericName && this.genericName !== this.name) {
      summary += ` (${this.genericName})`;
    }
    
    summary += ` ${this.dosage} ${this.frequency}`;
    
    if (dailyDose) {
      summary += ` - Total daily dose: ${dailyDose}${dosageInfo.unit || ''}`;
    }
    
    if (this.status !== 'active') {
      summary += ` [${this.status.toUpperCase()}]`;
    }

    return summary;
  }

  // Convert to Elasticsearch document
  toElasticsearchDocument(): any {
    const dosageInfo = this.parseDosage();
    const frequencyInfo = this.parseFrequency();
    const dailyDose = this.calculateDailyDose();
    const medicationClass = this.getMedicationClass();
    
    return {
      id: this.id,
      patient_id: this.patientId,
      type: 'medication',
      source: 'Pharmacy System',
      timestamp: this.startDate,
      title: `${this.name} - ${this.dosage} ${this.frequency}`,
      summary: this.generateSummary(),
      name: this.name,
      generic_name: this.genericName,
      dosage: this.dosage,
      frequency: this.frequency,
      route: this.route,
      start_date: this.startDate,
      end_date: this.endDate,
      status: this.status,
      prescribing_provider: this.prescribingProvider,
      interactions: this.interactions,
      side_effects: this.sideEffects,
      medication_class: medicationClass,
      is_high_risk: this.isHighRisk(),
      is_currently_active: this.isCurrentlyActive(),
      duration_days: this.getDurationInDays(),
      daily_dose: dailyDose,
      dosage_amount: dosageInfo.amount,
      dosage_unit: dosageInfo.unit,
      times_per_day: frequencyInfo.timesPerDay,
      common_side_effects: this.getCommonSideEffects(),
      searchable_text: this.generateSearchableText(),
    };
  }

  // Generate searchable text
  private generateSearchableText(): string {
    return [
      this.name,
      this.genericName || '',
      this.dosage,
      this.frequency,
      this.route,
      this.prescribingProvider,
      this.getMedicationClass(),
      ...this.sideEffects,
      ...this.getCommonSideEffects(),
    ].filter(Boolean).join(' ');
  }

  // Validate medication data
  validate(): string[] {
    const errors: string[] = [];

    if (!this.id) {
      errors.push('Medication ID is required');
    }

    if (!this.patientId) {
      errors.push('Patient ID is required');
    }

    if (!this.name) {
      errors.push('Medication name is required');
    }

    if (!this.dosage) {
      errors.push('Dosage is required');
    }

    if (!this.frequency) {
      errors.push('Frequency is required');
    }

    if (!this.route) {
      errors.push('Route of administration is required');
    }

    if (!this.prescribingProvider) {
      errors.push('Prescribing provider is required');
    }

    if (this.endDate && new Date(this.endDate) < new Date(this.startDate)) {
      errors.push('End date cannot be before start date');
    }

    return errors;
  }

  // Update medication
  update(updates: Partial<Medication>): void {
    Object.assign(this, updates);
  }

  // Discontinue medication
  discontinue(endDate?: string): void {
    this.status = 'discontinued';
    this.endDate = endDate || new Date().toISOString();
  }

  // Add interaction
  addInteraction(interaction: DrugInteraction): void {
    const exists = this.interactions.some(i => i.drugName === interaction.drugName);
    if (!exists) {
      this.interactions.push(interaction);
    }
  }

  // Add side effect
  addSideEffect(sideEffect: string): void {
    if (!this.sideEffects.includes(sideEffect)) {
      this.sideEffects.push(sideEffect);
    }
  }
}

export default MedicationModel;