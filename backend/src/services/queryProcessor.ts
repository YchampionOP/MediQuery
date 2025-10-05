import { UserRole } from '../types/index';
import { logger } from '../utils/logger';

interface ProcessedQuery {
  originalQuery: string;
  processedQuery: string;
  entities: MedicalEntities;
  intent: QueryIntent;
  confidence: number;
  suggestions: string[];
}

interface MedicalEntities {
  conditions: string[];
  medications: string[];
  procedures: string[];
  symptoms: string[];
  anatomicalSites: string[];
  demographics: string[];
  temporalExpressions: string[];
  labTests: string[];
  medicalCodes: string[];
}

interface QueryIntent {
  primary: string;
  secondary?: string;
  parameters: Record<string, any>;
}

export class QueryProcessor {
  private medicalTerms: Map<string, string[]>;
  private synonyms: Map<string, string[]>;
  private abbreviations: Map<string, string>;
  private intents: Map<string, RegExp[]>;

  constructor() {
    this.medicalTerms = new Map();
    this.synonyms = new Map();
    this.abbreviations = new Map();
    this.intents = new Map();
    this.initializeMedicalKnowledge();
  }

  private initializeMedicalKnowledge(): void {
    // Medical conditions with variants
    this.medicalTerms.set('conditions', [
      'diabetes', 'diabetes mellitus', 'type 2 diabetes', 'type 1 diabetes',
      'hypertension', 'high blood pressure', 'elevated blood pressure',
      'hyperlipidemia', 'high cholesterol', 'elevated cholesterol',
      'coronary artery disease', 'heart disease', 'cardiac disease',
      'myocardial infarction', 'heart attack', 'mi',
      'chronic obstructive pulmonary disease', 'copd', 'lung disease',
      'pneumonia', 'lung infection',
      'stroke', 'cerebrovascular accident', 'cva',
      'depression', 'major depressive disorder', 'mdd',
      'anxiety', 'anxiety disorder', 'generalized anxiety',
      'chronic kidney disease', 'renal disease', 'kidney disease'
    ]);

    // Medications
    this.medicalTerms.set('medications', [
      'metformin', 'glucophage',
      'insulin', 'lantus', 'humalog', 'novolog',
      'lisinopril', 'ace inhibitor', 'prinivil', 'zestril',
      'atorvastatin', 'lipitor', 'statin',
      'amlodipine', 'norvasc', 'calcium channel blocker',
      'aspirin', 'acetylsalicylic acid', 'asa',
      'furosemide', 'lasix', 'diuretic',
      'metoprolol', 'lopressor', 'beta blocker',
      'warfarin', 'coumadin', 'anticoagulant'
    ]);

    // Symptoms
    this.medicalTerms.set('symptoms', [
      'chest pain', 'chest discomfort', 'angina',
      'shortness of breath', 'dyspnea', 'difficulty breathing',
      'fatigue', 'tiredness', 'weakness',
      'dizziness', 'lightheadedness', 'vertigo',
      'nausea', 'vomiting', 'stomach upset',
      'headache', 'migraine', 'head pain',
      'fever', 'elevated temperature', 'pyrexia',
      'palpitations', 'irregular heartbeat', 'heart racing'
    ]);

    // Laboratory tests
    this.medicalTerms.set('labTests', [
      'hemoglobin a1c', 'hba1c', 'a1c', 'glycated hemoglobin',
      'glucose', 'blood sugar', 'blood glucose',
      'cholesterol', 'total cholesterol', 'lipid panel',
      'ldl cholesterol', 'ldl', 'bad cholesterol',
      'hdl cholesterol', 'hdl', 'good cholesterol',
      'triglycerides', 'tg',
      'creatinine', 'serum creatinine',
      'egfr', 'estimated glomerular filtration rate',
      'hemoglobin', 'hgb', 'hb',
      'white blood cell count', 'wbc', 'leukocytes',
      'platelet count', 'platelets'
    ]);

    // Procedures
    this.medicalTerms.set('procedures', [
      'ecg', 'ekg', 'electrocardiogram',
      'chest x-ray', 'cxr', 'chest radiograph',
      'ct scan', 'computed tomography', 'cat scan',
      'mri', 'magnetic resonance imaging',
      'ultrasound', 'sonogram',
      'echocardiogram', 'echo', 'cardiac ultrasound',
      'stress test', 'exercise stress test',
      'cardiac catheterization', 'angiogram',
      'colonoscopy', 'endoscopy'
    ]);

    // Initialize synonyms
    this.initializeSynonyms();
    
    // Initialize abbreviations
    this.initializeAbbreviations();
    
    // Initialize query intents
    this.initializeIntents();
  }

  private initializeSynonyms(): void {
    this.synonyms.set('diabetes', ['diabetes mellitus', 'dm', 'high blood sugar']);
    this.synonyms.set('hypertension', ['high blood pressure', 'htn', 'elevated bp']);
    this.synonyms.set('myocardial infarction', ['heart attack', 'mi', 'cardiac event']);
    this.synonyms.set('medication', ['drug', 'medicine', 'prescription', 'med']);
    this.synonyms.set('patient', ['individual', 'person', 'case', 'subject']);
    this.synonyms.set('test', ['lab', 'laboratory', 'blood work', 'analysis']);
  }

  private initializeAbbreviations(): void {
    this.abbreviations.set('dm', 'diabetes mellitus');
    this.abbreviations.set('htn', 'hypertension');
    this.abbreviations.set('mi', 'myocardial infarction');
    this.abbreviations.set('copd', 'chronic obstructive pulmonary disease');
    this.abbreviations.set('cad', 'coronary artery disease');
    this.abbreviations.set('chf', 'congestive heart failure');
    this.abbreviations.set('ckd', 'chronic kidney disease');
    this.abbreviations.set('mdd', 'major depressive disorder');
    this.abbreviations.set('ace', 'angiotensin converting enzyme');
    this.abbreviations.set('arb', 'angiotensin receptor blocker');
  }

  private initializeIntents(): void {
    this.intents.set('search_patients', [
      /(?:find|show|search|get|list)\s+(?:patients?|cases?)\s+(?:with|having|diagnosed)/i,
      /patients?\s+(?:with|having|diagnosed)\s+/i,
      /show\s+(?:me\s+)?(?:all\s+)?patients?/i
    ]);

    this.intents.set('explain_results', [
      /(?:explain|interpret|what\s+(?:is|does|means?))\s+(?:my|the|this)\s+(?:test|lab|result)/i,
      /what\s+(?:is|does|means?)\s+(?:a|an|my|the|this)/i,
      /help\s+(?:me\s+)?understand/i
    ]);

    this.intents.set('medication_info', [
      /(?:tell\s+me\s+about|what\s+is|information\s+about)\s+(?:my\s+)?(?:medication|medicine|drug)/i,
      /(?:side\s+effects?|interactions?)\s+(?:of|for)/i,
      /(?:how\s+(?:does|do)|what\s+(?:is|are))\s+.*(?:medication|medicine|drug)/i
    ]);

    this.intents.set('similar_cases', [
      /(?:find|show|search)\s+(?:similar|comparable)\s+(?:patients?|cases?)/i,
      /patients?\s+(?:similar|like|comparable)\s+to/i,
      /compare\s+(?:with|to)\s+(?:other\s+)?(?:patients?|cases?)/i
    ]);

    this.intents.set('research_evidence', [
      /(?:find|show|search)\s+(?:research|studies?|evidence|literature)/i,
      /(?:what\s+(?:does|do)\s+)?(?:research|studies?|evidence)\s+(?:say|show)/i,
      /(?:guidelines?|recommendations?)\s+for/i
    ]);

    this.intents.set('trend_analysis', [
      /(?:show|track|analyze)\s+(?:trends?|changes?|progress)/i,
      /(?:how\s+(?:has|have)|what\s+(?:is|are))\s+(?:my|the)\s+(?:trends?|changes?)/i,
      /(?:over\s+time|historical|progression)/i
    ]);
  }

  async processQuery(query: string, userRole: UserRole): Promise<ProcessedQuery> {
    try {
      logger.info(`Processing query for ${userRole}: "${query}"`);

      // Clean and normalize the query
      const cleanedQuery = this.cleanQuery(query);
      
      // Expand abbreviations
      const expandedQuery = this.expandAbbreviations(cleanedQuery);
      
      // Extract medical entities
      const entities = this.extractMedicalEntities(expandedQuery);
      
      // Determine query intent
      const intent = this.determineIntent(expandedQuery, userRole);
      
      // Enhance query with synonyms and medical terms
      const processedQuery = this.enhanceQuery(expandedQuery, entities);
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(entities, intent);
      
      // Generate suggestions
      const suggestions = this.generateQuerySuggestions(query, userRole, entities);

      const result: ProcessedQuery = {
        originalQuery: query,
        processedQuery,
        entities,
        intent,
        confidence,
        suggestions
      };

      logger.info(`Query processed with confidence: ${confidence}`);
      return result;

    } catch (error) {
      logger.error('Query processing failed:', error);
      throw new Error(`Query processing failed: ${(error as Error).message}`);
    }
  }

  private cleanQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\-\.]/g, ' ') // Remove special chars except hyphens and dots
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private expandAbbreviations(query: string): string {
    let expanded = query;
    
    for (const [abbrev, expansion] of this.abbreviations.entries()) {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      expanded = expanded.replace(regex, expansion);
    }
    
    return expanded;
  }

  private extractMedicalEntities(query: string): MedicalEntities {
    const entities: MedicalEntities = {
      conditions: [],
      medications: [],
      procedures: [],
      symptoms: [],
      anatomicalSites: [],
      demographics: [],
      temporalExpressions: [],
      labTests: [],
      medicalCodes: []
    };

    // Extract entities for each category
    for (const [category, terms] of this.medicalTerms.entries()) {
      const found = this.findTermsInQuery(query, terms);
      
      switch (category) {
        case 'conditions':
          entities.conditions = found;
          break;
        case 'medications':
          entities.medications = found;
          break;
        case 'procedures':
          entities.procedures = found;
          break;
        case 'symptoms':
          entities.symptoms = found;
          break;
        case 'labTests':
          entities.labTests = found;
          break;
      }
    }

    // Extract demographic information
    entities.demographics = this.extractDemographics(query);
    
    // Extract temporal expressions
    entities.temporalExpressions = this.extractTemporalExpressions(query);
    
    // Extract anatomical sites
    entities.anatomicalSites = this.extractAnatomicalSites(query);
    
    // Extract medical codes
    entities.medicalCodes = this.extractMedicalCodes(query);

    return entities;
  }

  private findTermsInQuery(query: string, terms: string[]): string[] {
    const found: string[] = [];
    
    for (const term of terms) {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(query)) {
        found.push(term);
      }
    }
    
    return [...new Set(found)]; // Remove duplicates
  }

  private extractDemographics(query: string): string[] {
    const demographics: string[] = [];
    
    // Age patterns
    const agePattern = /(\d+)\s*(?:year|yr|years?|age)/i;
    const ageMatch = query.match(agePattern);
    if (ageMatch) {
      demographics.push(`age ${ageMatch[1]}`);
    }

    // Age ranges
    const ageRangePattern = /(\d+)[-\s]*to[-\s]*(\d+)\s*(?:year|yr|years?)/i;
    const ageRangeMatch = query.match(ageRangePattern);
    if (ageRangeMatch) {
      demographics.push(`age ${ageRangeMatch[1]}-${ageRangeMatch[2]}`);
    }

    // Gender
    if (/\b(?:male|men|man)\b/i.test(query)) {
      demographics.push('male');
    }
    if (/\b(?:female|women|woman)\b/i.test(query)) {
      demographics.push('female');
    }

    // Elderly/young indicators
    if (/\b(?:elderly|senior|aged|old)\b/i.test(query)) {
      demographics.push('elderly');
    }
    if (/\b(?:young|pediatric|child|children)\b/i.test(query)) {
      demographics.push('young');
    }

    return demographics;
  }

  private extractTemporalExpressions(query: string): string[] {
    const temporal: string[] = [];
    
    const patterns = [
      /\b(?:last|past|previous)\s+(\d+)\s*(day|week|month|year)s?\b/i,
      /\b(?:recent|recently|latest)\b/i,
      /\b(?:today|yesterday|this\s+week|this\s+month|this\s+year)\b/i,
      /\b(?:within|in\s+the\s+last|over\s+the\s+past)\s+(\d+)\s*(day|week|month|year)s?\b/i
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        temporal.push(match[0]);
      }
    }

    return temporal;
  }

  private extractAnatomicalSites(query: string): string[] {
    const anatomicalSites = [
      'heart', 'cardiac', 'lung', 'pulmonary', 'kidney', 'renal',
      'liver', 'hepatic', 'brain', 'cerebral', 'chest', 'abdomen',
      'head', 'neck', 'arm', 'leg', 'back', 'spine'
    ];

    return this.findTermsInQuery(query, anatomicalSites);
  }

  private extractMedicalCodes(query: string): string[] {
    const codes: string[] = [];
    
    // ICD-10 patterns
    const icd10Pattern = /\b[A-Z]\d{2}(?:\.\d+)?\b/g;
    const icd10Matches = query.match(icd10Pattern);
    if (icd10Matches) {
      codes.push(...icd10Matches);
    }

    // CPT patterns
    const cptPattern = /\b\d{5}\b/g;
    const cptMatches = query.match(cptPattern);
    if (cptMatches) {
      codes.push(...cptMatches);
    }

    return codes;
  }

  private determineIntent(query: string, userRole: UserRole): QueryIntent {
    for (const [intentName, patterns] of this.intents.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          return {
            primary: intentName,
            parameters: this.extractIntentParameters(query, intentName, userRole)
          };
        }
      }
    }

    // Default intent based on user role
    const defaultIntent = userRole === 'clinician' ? 'search_patients' : 'explain_results';
    
    return {
      primary: defaultIntent,
      parameters: {}
    };
  }

  private extractIntentParameters(query: string, intent: string, userRole: UserRole): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    switch (intent) {
      case 'search_patients':
        parameters.searchType = 'patient_search';
        parameters.includeTimeline = userRole === 'clinician';
        break;
        
      case 'explain_results':
        parameters.simplify = userRole === 'patient';
        parameters.includeEducation = userRole === 'patient';
        break;
        
      case 'medication_info':
        parameters.includeSideEffects = true;
        parameters.includeInteractions = userRole === 'clinician';
        break;
        
      case 'similar_cases':
        parameters.similarity_threshold = 0.7;
        parameters.max_results = userRole === 'clinician' ? 20 : 5;
        break;
        
      case 'research_evidence':
        parameters.evidence_level = userRole === 'clinician' ? 'all' : 'high';
        parameters.include_guidelines = true;
        break;
    }
    
    return parameters;
  }

  private enhanceQuery(query: string, entities: MedicalEntities): string {
    let enhanced = query;
    
    // Add synonyms for found entities
    for (const condition of entities.conditions) {
      const synonyms = this.synonyms.get(condition) || [];
      if (synonyms.length > 0) {
        enhanced += ` ${synonyms.join(' ')}`;
      }
    }
    
    // Add related terms
    if (entities.conditions.some(c => c.includes('diabetes'))) {
      enhanced += ' glucose hba1c insulin blood sugar';
    }
    
    if (entities.conditions.some(c => c.includes('hypertension'))) {
      enhanced += ' blood pressure bp cardiovascular';
    }
    
    return enhanced;
  }

  private calculateConfidence(entities: MedicalEntities, intent: QueryIntent): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on entity extraction
    const totalEntities = Object.values(entities).flat().length;
    confidence += Math.min(totalEntities * 0.1, 0.3);
    
    // Increase confidence if intent was clearly identified
    if (intent.primary !== 'search_patients') {
      confidence += 0.2;
    }
    
    // Decrease confidence if no medical entities found
    if (totalEntities === 0) {
      confidence -= 0.2;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private generateQuerySuggestions(
    originalQuery: string, 
    userRole: UserRole, 
    entities: MedicalEntities
  ): string[] {
    const suggestions: string[] = [];
    
    if (userRole === 'clinician') {
      if (entities.conditions.length > 0) {
        suggestions.push(`Find similar patients with ${entities.conditions[0]}`);
        suggestions.push(`Research evidence for ${entities.conditions[0]} treatment`);
      }
      
      if (entities.medications.length > 0) {
        suggestions.push(`Drug interactions for ${entities.medications[0]}`);
      }
      
      suggestions.push('Clinical guidelines and protocols');
      suggestions.push('Patient risk assessment tools');
    } else {
      if (entities.labTests.length > 0) {
        suggestions.push(`Explain my ${entities.labTests[0]} results`);
      }
      
      if (entities.conditions.length > 0) {
        suggestions.push(`What is ${entities.conditions[0]}?`);
        suggestions.push(`Living with ${entities.conditions[0]}`);
      }
      
      suggestions.push('Understanding my test results');
      suggestions.push('When should I call my doctor?');
    }
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }

  // Additional utility methods
  
  expandMedicalAbbreviations(text: string): string {
    return this.expandAbbreviations(text);
  }

  validateMedicalTerms(terms: string[]): boolean {
    const allMedicalTerms = Array.from(this.medicalTerms.values()).flat();
    return terms.every(term => 
      allMedicalTerms.some(medTerm => 
        medTerm.toLowerCase().includes(term.toLowerCase())
      )
    );
  }

  suggestCorrections(query: string): string[] {
    // Simple spell checking for medical terms
    const corrections: string[] = [];
    const words = query.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (word.length > 3) {
        const allTerms = Array.from(this.medicalTerms.values()).flat();
        const similar = allTerms.filter(term => 
          this.calculateLevenshteinDistance(word, term.toLowerCase()) <= 2
        );
        
        if (similar.length > 0) {
          corrections.push(similar[0]);
        }
      }
    }
    
    return corrections;
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

export const queryProcessor = new QueryProcessor();