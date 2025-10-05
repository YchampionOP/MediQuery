import { logger } from '../utils/logger';
import { medicalOntologyService } from './medicalOntologies';
import { elasticsearchService } from './elasticsearch';

// Clinical Decision Support interfaces
export interface ClinicalGuideline {
  id: string;
  title: string;
  organization: string;
  version: string;
  lastUpdated: string;
  conditions: string[];
  recommendations: ClinicalRecommendation[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  url?: string;
  summary: string;
}

export interface ClinicalRecommendation {
  id: string;
  recommendation: string;
  strength: 'Strong' | 'Weak' | 'Conditional';
  evidenceQuality: 'High' | 'Moderate' | 'Low' | 'Very Low';
  conditions: string[];
  contraindications?: string[];
  considerations?: string[];
  monitoring?: string[];
}

export interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'Major' | 'Moderate' | 'Minor';
  mechanism: string;
  clinicalEffect: string;
  management: string;
  evidence: string;
  references: string[];
}

export interface QualityMeasure {
  id: string;
  name: string;
  description: string;
  category: 'Process' | 'Outcome' | 'Structure';
  condition: string;
  numerator: string;
  denominator: string;
  target: number;
  source: string;
}

export interface ClinicalAlert {
  id: string;
  type: 'Drug Interaction' | 'Allergy' | 'Duplicate Therapy' | 'Dosing' | 'Contraindication' | 'Quality Measure';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  message: string;
  recommendation: string;
  patientId: string;
  triggeredBy: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface EvidenceSource {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publishedDate: string;
  pmid?: string;
  doi?: string;
  abstractText: string;
  studyType: 'RCT' | 'Systematic Review' | 'Meta-Analysis' | 'Cohort' | 'Case-Control' | 'Case Series';
  evidenceLevel: number;
  relevanceScore: number;
}

export class ClinicalDecisionSupportService {
  private guidelines: Map<string, ClinicalGuideline> = new Map();
  private drugInteractions: Map<string, DrugInteraction[]> = new Map();
  private qualityMeasures: Map<string, QualityMeasure[]> = new Map();
  private evidenceSources: Map<string, EvidenceSource[]> = new Map();

  constructor() {
    this.initializeClinicalKnowledge();
  }

  private initializeClinicalKnowledge(): void {
    this.initializeGuidelines();
    this.initializeDrugInteractions();
    this.initializeQualityMeasures();
    this.initializeEvidenceSources();
    
    logger.info('Clinical decision support system initialized');
  }

  private initializeGuidelines(): void {
    const guidelines: ClinicalGuideline[] = [
      {
        id: 'aha-acc-diabetes-2023',
        title: 'Management of Type 2 Diabetes in Adults',
        organization: 'American Diabetes Association',
        version: '2023',
        lastUpdated: '2023-01-15',
        conditions: ['E11.9', 'Type 2 diabetes'],
        evidenceLevel: 'A',
        summary: 'Comprehensive guidelines for the management of type 2 diabetes in adults, including lifestyle interventions, pharmacologic therapy, and complication prevention.',
        recommendations: [
          {
            id: 'dm-metformin-first',
            recommendation: 'Metformin should be the first-line pharmacologic therapy for type 2 diabetes unless contraindicated',
            strength: 'Strong',
            evidenceQuality: 'High',
            conditions: ['Type 2 diabetes', 'newly diagnosed'],
            contraindications: ['eGFR < 30', 'metabolic acidosis'],
            considerations: ['Start with low dose to minimize GI side effects', 'Titrate based on glycemic response'],
            monitoring: ['HbA1c every 3-6 months', 'Renal function annually', 'Vitamin B12 if long-term use']
          },
          {
            id: 'dm-hba1c-target',
            recommendation: 'HbA1c target should be <7% for most adults with diabetes',
            strength: 'Strong',
            evidenceQuality: 'High',
            conditions: ['Type 2 diabetes'],
            considerations: ['Individualize based on age, comorbidities, and life expectancy', 'More stringent goals may be appropriate for younger patients'],
            monitoring: ['HbA1c every 3 months until stable, then every 6 months']
          }
        ]
      },
      {
        id: 'acc-aha-hypertension-2023',
        title: 'Hypertension Management Guidelines',
        organization: 'American College of Cardiology/American Heart Association',
        version: '2023',
        lastUpdated: '2023-03-01',
        conditions: ['I10', 'Essential hypertension'],
        evidenceLevel: 'A',
        summary: 'Evidence-based guidelines for the prevention, detection, evaluation, and management of high blood pressure in adults.',
        recommendations: [
          {
            id: 'htn-bp-target',
            recommendation: 'Blood pressure target should be <130/80 mmHg for most adults',
            strength: 'Strong',
            evidenceQuality: 'High',
            conditions: ['Hypertension'],
            considerations: ['Higher targets may be appropriate for adults ≥65 years with high burden of comorbidity'],
            monitoring: ['BP checks every 1-3 months during titration']
          },
          {
            id: 'htn-ace-inhibitor',
            recommendation: 'ACE inhibitors or ARBs are preferred first-line agents for patients with diabetes or chronic kidney disease',
            strength: 'Strong',
            evidenceQuality: 'High',
            conditions: ['Hypertension', 'diabetes', 'chronic kidney disease'],
            contraindications: ['Pregnancy', 'bilateral renal artery stenosis', 'hyperkalemia'],
            monitoring: ['Renal function and potassium within 1-2 weeks of initiation']
          }
        ]
      }
    ];

    guidelines.forEach(guideline => {
      this.guidelines.set(guideline.id, guideline);
      guideline.conditions.forEach(condition => {
        const conditionKey = condition.toLowerCase();
        if (!this.guidelines.has(conditionKey)) {
          // Create condition-based lookup
        }
      });
    });
  }

  private initializeDrugInteractions(): void {
    const interactions: DrugInteraction[] = [
      {
        drugA: 'Warfarin',
        drugB: 'Amiodarone',
        severity: 'Major',
        mechanism: 'Amiodarone inhibits CYP2C9 and CYP3A4, reducing warfarin metabolism',
        clinicalEffect: 'Increased anticoagulation effect, risk of bleeding',
        management: 'Reduce warfarin dose by 25-50% when starting amiodarone. Monitor INR closely.',
        evidence: 'Well-documented interaction with multiple case reports and studies',
        references: ['PMID: 12345678', 'PMID: 87654321']
      },
      {
        drugA: 'Metformin',
        drugB: 'Iodinated contrast',
        severity: 'Major',
        mechanism: 'Contrast-induced nephrotoxicity may reduce metformin clearance',
        clinicalEffect: 'Risk of lactic acidosis',
        management: 'Hold metformin 48 hours before and after contrast administration. Ensure normal renal function before resuming.',
        evidence: 'FDA black box warning and multiple case reports',
        references: ['FDA Drug Safety Communication']
      },
      {
        drugA: 'Lisinopril',
        drugB: 'Potassium supplement',
        severity: 'Moderate',
        mechanism: 'ACE inhibitors reduce aldosterone, increasing potassium retention',
        clinicalEffect: 'Hyperkalemia',
        management: 'Monitor serum potassium regularly. Consider potassium-sparing alternatives.',
        evidence: 'Well-established pharmacologic interaction',
        references: ['PMID: 11223344']
      }
    ];

    interactions.forEach(interaction => {
      const keyA = interaction.drugA.toLowerCase();
      const keyB = interaction.drugB.toLowerCase();
      
      if (!this.drugInteractions.has(keyA)) {
        this.drugInteractions.set(keyA, []);
      }
      if (!this.drugInteractions.has(keyB)) {
        this.drugInteractions.set(keyB, []);
      }
      
      this.drugInteractions.get(keyA)!.push(interaction);
      this.drugInteractions.get(keyB)!.push(interaction);
    });
  }

  private initializeQualityMeasures(): void {
    const measures: QualityMeasure[] = [
      {
        id: 'nqf-0001',
        name: 'Diabetes: Hemoglobin A1c Poor Control',
        description: 'Percentage of patients 18-75 years of age with diabetes who had hemoglobin A1c > 9.0% during the measurement period',
        category: 'Outcome',
        condition: 'diabetes',
        numerator: 'Patients with most recent HbA1c > 9.0%',
        denominator: 'Patients 18-75 years with diabetes',
        target: 0.15, // Target <15%
        source: 'CMS'
      },
      {
        id: 'nqf-0018',
        name: 'Controlling High Blood Pressure',
        description: 'Percentage of patients 18-85 years of age who had a diagnosis of hypertension and whose blood pressure was adequately controlled',
        category: 'Outcome',
        condition: 'hypertension',
        numerator: 'Patients with most recent BP <140/90 mmHg',
        denominator: 'Patients 18-85 years with hypertension',
        target: 0.70, // Target >70%
        source: 'CMS'
      }
    ];

    measures.forEach(measure => {
      const condition = measure.condition.toLowerCase();
      if (!this.qualityMeasures.has(condition)) {
        this.qualityMeasures.set(condition, []);
      }
      this.qualityMeasures.get(condition)!.push(measure);
    });
  }

  private initializeEvidenceSources(): void {
    const evidence: EvidenceSource[] = [
      {
        id: 'pmid-12345678',
        title: 'Cardiovascular Effects of Metformin in Type 2 Diabetes: A Systematic Review',
        authors: ['Smith J', 'Johnson M', 'Brown K'],
        journal: 'New England Journal of Medicine',
        publishedDate: '2023-01-15',
        pmid: '12345678',
        doi: '10.1056/NEJMoa2023001',
        abstractText: 'Background: Metformin is widely used as first-line therapy for type 2 diabetes, but its cardiovascular effects remain unclear...',
        studyType: 'Systematic Review',
        evidenceLevel: 1,
        relevanceScore: 0.95
      },
      {
        id: 'pmid-87654321',
        title: 'ACE Inhibitors vs ARBs in Hypertensive Patients with Diabetes: A Randomized Trial',
        authors: ['Davis R', 'Wilson T', 'Lee S'],
        journal: 'JAMA',
        publishedDate: '2022-11-30',
        pmid: '87654321',
        doi: '10.1001/jama.2022.12345',
        abstractText: 'Importance: The choice between ACE inhibitors and ARBs in diabetic patients with hypertension...',
        studyType: 'RCT',
        evidenceLevel: 1,
        relevanceScore: 0.92
      }
    ];

    evidence.forEach(source => {
      // Index by keywords from title and abstract
      const keywords = this.extractKeywords(source.title + ' ' + source.abstractText);
      keywords.forEach(keyword => {
        if (!this.evidenceSources.has(keyword)) {
          this.evidenceSources.set(keyword, []);
        }
        this.evidenceSources.get(keyword)!.push(source);
      });
    });
  }

  private extractKeywords(text: string): string[] {
    const medicalTerms = [
      'diabetes', 'hypertension', 'metformin', 'ace inhibitor', 'arb',
      'cardiovascular', 'kidney', 'blood pressure', 'glucose', 'hba1c'
    ];
    
    const normalizedText = text.toLowerCase();
    return medicalTerms.filter(term => normalizedText.includes(term));
  }

  // Public methods for clinical decision support
  async getClinicalRecommendations(
    patientConditions: string[],
    medications: string[],
    labResults?: any[]
  ): Promise<ClinicalRecommendation[]> {
    const recommendations: ClinicalRecommendation[] = [];
    
    // Find relevant guidelines based on patient conditions
    for (const guideline of this.guidelines.values()) {
      const hasRelevantCondition = guideline.conditions.some(condition =>
        patientConditions.some(patientCondition =>
          patientCondition.toLowerCase().includes(condition.toLowerCase()) ||
          condition.toLowerCase().includes(patientCondition.toLowerCase())
        )
      );
      
      if (hasRelevantCondition) {
        recommendations.push(...guideline.recommendations);
      }
    }
    
    // Filter recommendations based on current medications and contraindications
    return recommendations.filter(rec => {
      if (rec.contraindications) {
        return !rec.contraindications.some(contraindication =>
          medications.some(med =>
            med.toLowerCase().includes(contraindication.toLowerCase())
          )
        );
      }
      return true;
    });
  }

  async checkDrugInteractions(medications: string[]): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drugA = medications[i].toLowerCase();
        const drugB = medications[j].toLowerCase();
        
        const drugAInteractions = this.drugInteractions.get(drugA) || [];
        const relevantInteractions = drugAInteractions.filter(interaction =>
          interaction.drugB.toLowerCase() === drugB ||
          interaction.drugA.toLowerCase() === drugB
        );
        
        interactions.push(...relevantInteractions);
      }
    }
    
    return interactions.sort((a, b) => {
      const severityOrder = { 'Major': 3, 'Moderate': 2, 'Minor': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  async generateClinicalAlerts(
    patientId: string,
    patientData: {
      conditions: string[];
      medications: string[];
      allergies?: string[];
      labResults?: any[];
      age?: number;
    }
  ): Promise<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = [];
    
    // Check for drug interactions
    const interactions = await this.checkDrugInteractions(patientData.medications);
    interactions.forEach(interaction => {
      const severity = interaction.severity === 'Major' ? 'Critical' :
                     interaction.severity === 'Moderate' ? 'High' : 'Medium';
      
      alerts.push({
        id: `drug-interaction-${Date.now()}-${Math.random()}`,
        type: 'Drug Interaction',
        severity,
        message: `${interaction.drugA} and ${interaction.drugB}: ${interaction.clinicalEffect}`,
        recommendation: interaction.management,
        patientId,
        triggeredBy: `${interaction.drugA}, ${interaction.drugB}`,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    });
    
    // Check for allergy conflicts
    if (patientData.allergies) {
      patientData.medications.forEach(medication => {
        patientData.allergies!.forEach(allergy => {
          if (medication.toLowerCase().includes(allergy.toLowerCase()) ||
              allergy.toLowerCase().includes(medication.toLowerCase())) {
            alerts.push({
              id: `allergy-${Date.now()}-${Math.random()}`,
              type: 'Allergy',
              severity: 'Critical',
              message: `Patient is allergic to ${allergy} but is prescribed ${medication}`,
              recommendation: 'Review allergy history and consider alternative medication',
              patientId,
              triggeredBy: medication,
              timestamp: new Date().toISOString(),
              acknowledged: false
            });
          }
        });
      });
    }
    
    // Check quality measures
    for (const condition of patientData.conditions) {
      const measures = this.qualityMeasures.get(condition.toLowerCase()) || [];
      measures.forEach(measure => {
        // This would typically involve more complex logic based on patient data
        if (measure.id === 'nqf-0001' && patientData.labResults) {
          const hba1c = patientData.labResults.find(lab => 
            lab.testName && lab.testName.toLowerCase().includes('hba1c')
          );
          if (hba1c && hba1c.value > 9.0) {
            alerts.push({
              id: `quality-${measure.id}-${Date.now()}`,
              type: 'Quality Measure',
              severity: 'Medium',
              message: `HbA1c > 9.0% - Quality measure alert`,
              recommendation: 'Consider intensifying diabetes management',
              patientId,
              triggeredBy: 'HbA1c result',
              timestamp: new Date().toISOString(),
              acknowledged: false
            });
          }
        }
      });
    }
    
    return alerts.sort((a, b) => {
      const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Info': 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  async searchEvidence(query: string, conditions: string[] = []): Promise<EvidenceSource[]> {
    const keywords = this.extractKeywords(query);
    const evidenceMap = new Map<string, EvidenceSource>();
    
    // Search by keywords
    keywords.forEach(keyword => {
      const sources = this.evidenceSources.get(keyword) || [];
      sources.forEach(source => {
        evidenceMap.set(source.id, source);
      });
    });
    
    // Search by conditions
    conditions.forEach(condition => {
      const conditionKeywords = this.extractKeywords(condition);
      conditionKeywords.forEach(keyword => {
        const sources = this.evidenceSources.get(keyword) || [];
        sources.forEach(source => {
          evidenceMap.set(source.id, source);
        });
      });
    });
    
    const results = Array.from(evidenceMap.values());
    
    // Sort by relevance score and evidence level
    return results.sort((a, b) => {
      if (a.evidenceLevel !== b.evidenceLevel) {
        return a.evidenceLevel - b.evidenceLevel; // Lower is better
      }
      return b.relevanceScore - a.relevanceScore; // Higher is better
    });
  }

  async getQualityMeasures(conditions: string[]): Promise<QualityMeasure[]> {
    const measures: QualityMeasure[] = [];
    
    conditions.forEach(condition => {
      const conditionMeasures = this.qualityMeasures.get(condition.toLowerCase()) || [];
      measures.push(...conditionMeasures);
    });
    
    return measures;
  }

  async getClinicalGuidelines(conditions: string[]): Promise<ClinicalGuideline[]> {
    const guidelines: ClinicalGuideline[] = [];
    
    for (const guideline of this.guidelines.values()) {
      const isRelevant = guideline.conditions.some(guidelineCondition =>
        conditions.some(condition =>
          condition.toLowerCase().includes(guidelineCondition.toLowerCase()) ||
          guidelineCondition.toLowerCase().includes(condition.toLowerCase())
        )
      );
      
      if (isRelevant) {
        guidelines.push(guideline);
      }
    }
    
    return guidelines.sort((a, b) => {
      const evidenceOrder = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
      return evidenceOrder[b.evidenceLevel] - evidenceOrder[a.evidenceLevel];
    });
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    // In a real implementation, this would update the alert in a database
    logger.info(`Alert ${alertId} acknowledged by user ${userId}`);
    return true;
  }

  async getAlertHistory(patientId: string, days: number = 30): Promise<ClinicalAlert[]> {
    // In a real implementation, this would query a database
    // For now, return empty array as this is a mock implementation
    return [];
  }
}

// Singleton instance
export const clinicalDecisionSupportService = new ClinicalDecisionSupportService();