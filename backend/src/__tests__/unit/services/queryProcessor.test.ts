import { describe, it, expect, beforeEach } from '@jest/globals';
import { queryProcessor } from '../../../services/queryProcessor';
import { UserRole } from '../../../types/index';

describe('QueryProcessor', () => {
  describe('processQuery', () => {
    it('should process a simple medical query', async () => {
      const query = 'show me patients with diabetes';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.originalQuery).toBe(query);
      expect(result.entities.conditions).toContain('diabetes');
      expect(result.intent.primary).toBe('search_patients');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should expand medical abbreviations', async () => {
      const query = 'patients with dm and htn';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.processedQuery).toContain('diabetes mellitus');
      expect(result.processedQuery).toContain('hypertension');
    });

    it('should extract medication entities', async () => {
      const query = 'side effects of metformin';
      const result = await queryProcessor.processQuery(query, 'patient');
      
      expect(result.entities.medications).toContain('metformin');
      expect(result.intent.primary).toBe('medication_info');
    });

    it('should extract demographic information', async () => {
      const query = 'elderly male patients over 65 years';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.entities.demographics).toContain('male');
      expect(result.entities.demographics).toContain('elderly');
    });

    it('should extract temporal expressions', async () => {
      const query = 'lab results from last 30 days';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.entities.temporalExpressions.length).toBeGreaterThan(0);
    });

    it('should generate role-appropriate suggestions for clinicians', async () => {
      const query = 'diabetes management';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.suggestions).toContain('Find similar patients with diabetes');
      expect(result.suggestions).toContain('Research evidence for diabetes treatment');
    });

    it('should generate role-appropriate suggestions for patients', async () => {
      const query = 'blood sugar results';
      const result = await queryProcessor.processQuery(query, 'patient');
      
      expect(result.suggestions.some(s => s.includes('explain'))).toBe(true);
    });

    it('should handle complex medical queries', async () => {
      const query = 'Type 2 diabetes patients with HbA1c > 8% and hypertension';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.entities.conditions).toContain('diabetes');
      expect(result.entities.conditions).toContain('hypertension');
      expect(result.entities.labTests).toContain('hemoglobin a1c');
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('expandMedicalAbbreviations', () => {
    it('should expand common medical abbreviations', () => {
      const text = 'patient with dm and htn';
      const expanded = queryProcessor.expandMedicalAbbreviations(text);
      
      expect(expanded).toContain('diabetes mellitus');
      expect(expanded).toContain('hypertension');
    });

    it('should handle multiple abbreviations in one text', () => {
      const text = 'mi copd chf';
      const expanded = queryProcessor.expandMedicalAbbreviations(text);
      
      expect(expanded).toContain('myocardial infarction');
      expect(expanded).toContain('chronic obstructive pulmonary disease');
      expect(expanded).toContain('congestive heart failure');
    });
  });

  describe('validateMedicalTerms', () => {
    it('should validate known medical terms', () => {
      const terms = ['diabetes', 'hypertension', 'metformin'];
      const isValid = queryProcessor.validateMedicalTerms(terms);
      expect(isValid).toBe(true);
    });

    it('should reject unknown terms', () => {
      const terms = ['randomword', 'notmedical'];
      const isValid = queryProcessor.validateMedicalTerms(terms);
      expect(isValid).toBe(false);
    });
  });

  describe('suggestCorrections', () => {
    it('should suggest corrections for misspelled medical terms', () => {
      const query = 'diabets hypertnsion';
      const corrections = queryProcessor.suggestCorrections(query);
      
      expect(corrections.length).toBeGreaterThan(0);
      expect(corrections.some(c => c.includes('diabetes'))).toBe(true);
    });

    it('should handle correctly spelled terms', () => {
      const query = 'diabetes hypertension';
      const corrections = queryProcessor.suggestCorrections(query);
      
      // Should return the correct terms or related ones
      expect(corrections.every(c => c.length > 0)).toBe(true);
    });
  });

  describe('intent detection', () => {
    it('should detect search patient intent', async () => {
      const queries = [
        'find patients with diabetes',
        'show me cases with hypertension',
        'patients having chest pain'
      ];

      for (const query of queries) {
        const result = await queryProcessor.processQuery(query, 'clinician');
        expect(result.intent.primary).toBe('search_patients');
      }
    });

    it('should detect explain results intent', async () => {
      const queries = [
        'explain my lab results',
        'what does this test mean',
        'help me understand my HbA1c'
      ];

      for (const query of queries) {
        const result = await queryProcessor.processQuery(query, 'patient');
        expect(result.intent.primary).toBe('explain_results');
      }
    });

    it('should detect medication info intent', async () => {
      const queries = [
        'side effects of metformin',
        'what is lisinopril used for',
        'drug interactions with warfarin'
      ];

      for (const query of queries) {
        const result = await queryProcessor.processQuery(query, 'patient');
        expect(result.intent.primary).toBe('medication_info');
      }
    });

    it('should detect similar cases intent', async () => {
      const queries = [
        'find similar patients',
        'comparable cases to this patient',
        'patients like this one'
      ];

      for (const query of queries) {
        const result = await queryProcessor.processQuery(query, 'clinician');
        expect(result.intent.primary).toBe('similar_cases');
      }
    });
  });

  describe('entity extraction', () => {
    it('should extract multiple entity types from complex queries', async () => {
      const query = 'elderly diabetic patients on metformin with recent chest pain and elevated troponin';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.entities.conditions).toContain('diabetes');
      expect(result.entities.medications).toContain('metformin');
      expect(result.entities.symptoms).toContain('chest pain');
      expect(result.entities.demographics).toContain('elderly');
      expect(result.entities.temporalExpressions).toContain('recent');
    });

    it('should extract lab test names', async () => {
      const query = 'HbA1c results and glucose levels';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.entities.labTests).toContain('hemoglobin a1c');
      expect(result.entities.labTests).toContain('glucose');
    });

    it('should extract anatomical sites', async () => {
      const query = 'chest pain and heart problems';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.entities.anatomicalSites).toContain('chest');
      expect(result.entities.anatomicalSites).toContain('heart');
    });
  });

  describe('confidence scoring', () => {
    it('should assign higher confidence to queries with clear medical entities', async () => {
      const medicalQuery = 'patients with type 2 diabetes on metformin';
      const vagueQuery = 'show me something';
      
      const medicalResult = await queryProcessor.processQuery(medicalQuery, 'clinician');
      const vagueResult = await queryProcessor.processQuery(vagueQuery, 'clinician');
      
      expect(medicalResult.confidence).toBeGreaterThan(vagueResult.confidence);
    });

    it('should assign appropriate confidence levels', async () => {
      const query = 'diabetes hypertension medications';
      const result = await queryProcessor.processQuery(query, 'clinician');
      
      expect(result.confidence).toBeGreaterThan(0.1);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });
  });
});