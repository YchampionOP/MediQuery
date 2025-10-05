import { logger } from '../utils/logger';

// Medical code interfaces
export interface ICD10Code {
  code: string;
  description: string;
  category: string;
  subcategory?: string;
  billable: boolean;
  deprecated?: boolean;
  synonyms?: string[];
}

export interface SNOMEDCTConcept {
  conceptId: string;
  term: string;
  fsn: string; // Fully specified name
  semanticTag: string;
  active: boolean;
  moduleId: string;
  definitionStatus: string;
  synonyms?: string[];
  relationships?: SNOMEDRelationship[];
}

export interface SNOMEDRelationship {
  sourceId: string;
  typeId: string;
  destinationId: string;
  relationshipGroup: number;
  active: boolean;
}

export interface CPTCode {
  code: string;
  shortDescription: string;
  mediumDescription: string;
  longDescription: string;
  category: string;
  subcategory?: string;
  modifiers?: string[];
  rvuWork?: number;
  rvuPracticeExpense?: number;
  rvuMalpractice?: number;
}

export interface MedicalCodeMapping {
  sourceCode: string;
  sourceSystem: 'ICD10' | 'SNOMED' | 'CPT';
  targetCode: string;
  targetSystem: 'ICD10' | 'SNOMED' | 'CPT';
  mappingType: 'EXACT' | 'APPROXIMATE' | 'BROADER' | 'NARROWER';
  confidence: number;
}

export class MedicalOntologyService {
  private icd10Codes: Map<string, ICD10Code> = new Map();
  private snomedConcepts: Map<string, SNOMEDCTConcept> = new Map();
  private cptCodes: Map<string, CPTCode> = new Map();
  private codeMappings: Map<string, MedicalCodeMapping[]> = new Map();
  private synonymMaps: Map<string, string[]> = new Map();

  constructor() {
    this.initializeMedicalCodes();
  }

  private initializeMedicalCodes(): void {
    // Initialize with common medical codes - in production, these would be loaded from files/databases
    this.initializeICD10Codes();
    this.initializeSNOMEDCodes();
    this.initializeCPTCodes();
    this.initializeCodeMappings();
    this.buildSynonymMaps();
    
    logger.info('Medical ontologies initialized');
  }

  private initializeICD10Codes(): void {
    const commonICD10Codes: ICD10Code[] = [
      {
        code: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        category: 'Endocrine, nutritional and metabolic diseases',
        subcategory: 'Diabetes mellitus',
        billable: true,
        synonyms: ['Type 2 diabetes', 'NIDDM', 'Adult-onset diabetes']
      },
      {
        code: 'I10',
        description: 'Essential hypertension',
        category: 'Diseases of the circulatory system',
        subcategory: 'Hypertensive diseases',
        billable: true,
        synonyms: ['High blood pressure', 'HTN', 'Primary hypertension']
      },
      {
        code: 'E78.5',
        description: 'Hyperlipidemia, unspecified',
        category: 'Endocrine, nutritional and metabolic diseases',
        subcategory: 'Metabolic disorders',
        billable: true,
        synonyms: ['High cholesterol', 'Dyslipidemia']
      },
      {
        code: 'I25.10',
        description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
        category: 'Diseases of the circulatory system',
        subcategory: 'Ischemic heart diseases',
        billable: true,
        synonyms: ['Coronary artery disease', 'CAD', 'Coronary heart disease']
      },
      {
        code: 'J44.1',
        description: 'Chronic obstructive pulmonary disease with acute exacerbation',
        category: 'Diseases of the respiratory system',
        subcategory: 'Chronic lower respiratory diseases',
        billable: true,
        synonyms: ['COPD exacerbation', 'COPD acute']
      },
      {
        code: 'N18.3',
        description: 'Chronic kidney disease, stage 3',
        category: 'Diseases of the genitourinary system',
        subcategory: 'Chronic kidney disease',
        billable: true,
        synonyms: ['CKD stage 3', 'Chronic renal disease']
      },
      {
        code: 'F32.9',
        description: 'Major depressive disorder, single episode, unspecified',
        category: 'Mental and behavioral disorders',
        subcategory: 'Mood disorders',
        billable: true,
        synonyms: ['Depression', 'MDD', 'Major depression']
      }
    ];

    commonICD10Codes.forEach(code => {
      this.icd10Codes.set(code.code, code);
    });
  }

  private initializeSNOMEDCodes(): void {
    const commonSNOMEDCodes: SNOMEDCTConcept[] = [
      {
        conceptId: '44054006',
        term: 'Diabetes mellitus type 2',
        fsn: 'Diabetes mellitus type 2 (disorder)',
        semanticTag: 'disorder',
        active: true,
        moduleId: '900000000000207008',
        definitionStatus: 'Primitive',
        synonyms: ['Type 2 diabetes', 'NIDDM', 'Adult-onset diabetes']
      },
      {
        conceptId: '38341003',
        term: 'Essential hypertension',
        fsn: 'Essential hypertension (disorder)',
        semanticTag: 'disorder',
        active: true,
        moduleId: '900000000000207008',
        definitionStatus: 'Primitive',
        synonyms: ['High blood pressure', 'HTN', 'Primary hypertension']
      },
      {
        conceptId: '55822004',
        term: 'Hyperlipidemia',
        fsn: 'Hyperlipidemia (disorder)',
        semanticTag: 'disorder',
        active: true,
        moduleId: '900000000000207008',
        definitionStatus: 'Primitive',
        synonyms: ['High cholesterol', 'Dyslipidemia']
      },
      {
        conceptId: '53741008',
        term: 'Coronary artery disease',
        fsn: 'Coronary artery disease (disorder)',
        semanticTag: 'disorder',
        active: true,
        moduleId: '900000000000207008',
        definitionStatus: 'Primitive',
        synonyms: ['CAD', 'Coronary heart disease', 'Ischemic heart disease']
      }
    ];

    commonSNOMEDCodes.forEach(concept => {
      this.snomedConcepts.set(concept.conceptId, concept);
    });
  }

  private initializeCPTCodes(): void {
    const commonCPTCodes: CPTCode[] = [
      {
        code: '99213',
        shortDescription: 'Office/outpatient visit est',
        mediumDescription: 'Office or other outpatient visit for the evaluation and management of an established patient',
        longDescription: 'Office or other outpatient visit for the evaluation and management of an established patient, which requires a medically appropriate history and/or examination and low level of medical decision making',
        category: 'Evaluation and Management',
        subcategory: 'Office Visits',
        rvuWork: 0.97,
        rvuPracticeExpense: 1.22,
        rvuMalpractice: 0.07
      },
      {
        code: '80053',
        shortDescription: 'Comprehensive metabolic panel',
        mediumDescription: 'Comprehensive metabolic panel (glucose, electrolytes, kidney function, liver function)',
        longDescription: 'Comprehensive metabolic panel including glucose, albumin, BUN, creatinine, sodium, potassium, chloride, CO2, bilirubin, ALT, AST, alkaline phosphatase',
        category: 'Pathology and Laboratory',
        subcategory: 'Organ or Disease-Oriented Panels',
        rvuWork: 0.00,
        rvuPracticeExpense: 3.28,
        rvuMalpractice: 0.01
      },
      {
        code: '93306',
        shortDescription: 'Echocardiography, complete',
        mediumDescription: 'Echocardiography, transthoracic, real-time with image documentation',
        longDescription: 'Echocardiography, transthoracic, real-time with image documentation (2D), includes M-mode recording, when performed, complete, with spectral Doppler echocardiography, and with color flow Doppler echocardiography',
        category: 'Medicine',
        subcategory: 'Cardiovascular',
        rvuWork: 1.15,
        rvuPracticeExpense: 2.78,
        rvuMalpractice: 0.08
      }
    ];

    commonCPTCodes.forEach(code => {
      this.cptCodes.set(code.code, code);
    });
  }

  private initializeCodeMappings(): void {
    const mappings: MedicalCodeMapping[] = [
      {
        sourceCode: 'E11.9',
        sourceSystem: 'ICD10',
        targetCode: '44054006',
        targetSystem: 'SNOMED',
        mappingType: 'EXACT',
        confidence: 0.95
      },
      {
        sourceCode: 'I10',
        sourceSystem: 'ICD10',
        targetCode: '38341003',
        targetSystem: 'SNOMED',
        mappingType: 'EXACT',
        confidence: 0.95
      }
    ];

    mappings.forEach(mapping => {
      const key = `${mapping.sourceSystem}:${mapping.sourceCode}`;
      if (!this.codeMappings.has(key)) {
        this.codeMappings.set(key, []);
      }
      this.codeMappings.get(key)!.push(mapping);
    });
  }

  private buildSynonymMaps(): void {
    // Build synonym maps for faster lookup
    this.icd10Codes.forEach(code => {
      if (code.synonyms) {
        code.synonyms.forEach(synonym => {
          const normalizedSynonym = this.normalizeText(synonym);
          if (!this.synonymMaps.has(normalizedSynonym)) {
            this.synonymMaps.set(normalizedSynonym, []);
          }
          this.synonymMaps.get(normalizedSynonym)!.push(code.code);
        });
      }
    });

    this.snomedConcepts.forEach(concept => {
      if (concept.synonyms) {
        concept.synonyms.forEach(synonym => {
          const normalizedSynonym = this.normalizeText(synonym);
          if (!this.synonymMaps.has(normalizedSynonym)) {
            this.synonymMaps.set(normalizedSynonym, []);
          }
          this.synonymMaps.get(normalizedSynonym)!.push(concept.conceptId);
        });
      }
    });
  }

  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Public methods for code lookup and validation
  getICD10Code(code: string): ICD10Code | null {
    return this.icd10Codes.get(code) || null;
  }

  getSNOMEDConcept(conceptId: string): SNOMEDCTConcept | null {
    return this.snomedConcepts.get(conceptId) || null;
  }

  getCPTCode(code: string): CPTCode | null {
    return this.cptCodes.get(code) || null;
  }

  validateMedicalCode(code: string, system: 'ICD10' | 'SNOMED' | 'CPT'): boolean {
    switch (system) {
      case 'ICD10':
        return this.icd10Codes.has(code);
      case 'SNOMED':
        return this.snomedConcepts.has(code);
      case 'CPT':
        return this.cptCodes.has(code);
      default:
        return false;
    }
  }

  searchMedicalCodes(query: string, systems: ('ICD10' | 'SNOMED' | 'CPT')[] = ['ICD10', 'SNOMED', 'CPT']): any[] {
    const results: any[] = [];
    const normalizedQuery = this.normalizeText(query);

    // Search ICD-10 codes
    if (systems.includes('ICD10')) {
      this.icd10Codes.forEach(code => {
        const normalizedDescription = this.normalizeText(code.description);
        const normalizedCode = this.normalizeText(code.code);
        
        if (normalizedDescription.includes(normalizedQuery) || 
            normalizedCode.includes(normalizedQuery) ||
            (code.synonyms && code.synonyms.some(syn => 
              this.normalizeText(syn).includes(normalizedQuery)))) {
          results.push({
            system: 'ICD10',
            code: code.code,
            description: code.description,
            category: code.category,
            relevance: this.calculateRelevance(query, code.description)
          });
        }
      });
    }

    // Search SNOMED-CT concepts
    if (systems.includes('SNOMED')) {
      this.snomedConcepts.forEach(concept => {
        const normalizedTerm = this.normalizeText(concept.term);
        const normalizedFsn = this.normalizeText(concept.fsn);
        
        if (normalizedTerm.includes(normalizedQuery) || 
            normalizedFsn.includes(normalizedQuery) ||
            (concept.synonyms && concept.synonyms.some(syn => 
              this.normalizeText(syn).includes(normalizedQuery)))) {
          results.push({
            system: 'SNOMED',
            code: concept.conceptId,
            description: concept.term,
            fsn: concept.fsn,
            relevance: this.calculateRelevance(query, concept.term)
          });
        }
      });
    }

    // Search CPT codes
    if (systems.includes('CPT')) {
      this.cptCodes.forEach(code => {
        const normalizedDescription = this.normalizeText(code.longDescription);
        const normalizedCode = this.normalizeText(code.code);
        
        if (normalizedDescription.includes(normalizedQuery) || 
            normalizedCode.includes(normalizedQuery)) {
          results.push({
            system: 'CPT',
            code: code.code,
            description: code.shortDescription,
            category: code.category,
            relevance: this.calculateRelevance(query, code.longDescription)
          });
        }
      });
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  private calculateRelevance(query: string, text: string): number {
    const normalizedQuery = this.normalizeText(query);
    const normalizedText = this.normalizeText(text);
    
    // Simple relevance calculation based on term frequency
    const queryTerms = normalizedQuery.split(' ');
    const textTerms = normalizedText.split(' ');
    
    let matches = 0;
    queryTerms.forEach(term => {
      if (textTerms.includes(term)) {
        matches++;
      }
    });
    
    return matches / queryTerms.length;
  }

  mapBetweenSystems(code: string, fromSystem: 'ICD10' | 'SNOMED' | 'CPT', toSystem: 'ICD10' | 'SNOMED' | 'CPT'): MedicalCodeMapping[] {
    const key = `${fromSystem}:${code}`;
    const mappings = this.codeMappings.get(key) || [];
    return mappings.filter(mapping => mapping.targetSystem === toSystem);
  }

  getCodeHierarchy(code: string, system: 'ICD10' | 'SNOMED' | 'CPT'): any {
    // This would typically connect to a terminology server
    // For now, return basic hierarchy information
    switch (system) {
      case 'ICD10':
        const icdCode = this.getICD10Code(code);
        return icdCode ? {
          code: icdCode.code,
          description: icdCode.description,
          category: icdCode.category,
          subcategory: icdCode.subcategory,
          level: this.getICD10Level(code)
        } : null;
      
      case 'SNOMED':
        const snomedConcept = this.getSNOMEDConcept(code);
        return snomedConcept ? {
          conceptId: snomedConcept.conceptId,
          term: snomedConcept.term,
          semanticTag: snomedConcept.semanticTag,
          relationships: snomedConcept.relationships || []
        } : null;
        
      default:
        return null;
    }
  }

  private getICD10Level(code: string): number {
    // Determine ICD-10 hierarchy level based on code structure
    if (code.length === 1) return 1; // Chapter level (A-Z)
    if (code.length === 3) return 2; // Category level (A00-Z99)
    if (code.includes('.')) return 3; // Subcategory level (A00.0-Z99.9)
    return 0;
  }

  extractMedicalCodesFromText(text: string): { codes: any[], confidence: number } {
    const extractedCodes: any[] = [];
    const normalizedText = this.normalizeText(text);
    
    // Pattern matching for different code formats
    const icd10Pattern = /\b[A-Z]\d{2}(?:\.\d+)?\b/g;
    const snomedPattern = /\b\d{6,18}\b/g;
    const cptPattern = /\b\d{5}\b/g;
    
    // Extract ICD-10 codes
    const icd10Matches = text.match(icd10Pattern) || [];
    icd10Matches.forEach(match => {
      const code = this.getICD10Code(match);
      if (code) {
        extractedCodes.push({
          system: 'ICD10',
          code: match,
          description: code.description,
          confidence: 0.9
        });
      }
    });
    
    // Extract potential SNOMED codes (would need more sophisticated validation)
    const snomedMatches = text.match(snomedPattern) || [];
    snomedMatches.forEach(match => {
      const concept = this.getSNOMEDConcept(match);
      if (concept) {
        extractedCodes.push({
          system: 'SNOMED',
          code: match,
          description: concept.term,
          confidence: 0.8
        });
      }
    });
    
    // Extract CPT codes
    const cptMatches = text.match(cptPattern) || [];
    cptMatches.forEach(match => {
      const code = this.getCPTCode(match);
      if (code) {
        extractedCodes.push({
          system: 'CPT',
          code: match,
          description: code.shortDescription,
          confidence: 0.9
        });
      }
    });
    
    const overallConfidence = extractedCodes.length > 0 ? 
      extractedCodes.reduce((sum, code) => sum + code.confidence, 0) / extractedCodes.length : 0;
    
    return { codes: extractedCodes, confidence: overallConfidence };
  }
}

// Singleton instance
export const medicalOntologyService = new MedicalOntologyService();