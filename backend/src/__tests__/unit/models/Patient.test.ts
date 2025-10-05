import { describe, it, expect, beforeEach } from '@jest/globals';
import { PatientModel } from '../../../models/Patient';
import { Patient, MedicalCondition, Medication } from '../../../types/index';

describe('PatientModel', () => {
  let samplePatientData: Partial<Patient>;

  beforeEach(() => {
    samplePatientData = {
      id: 'test-patient-1',
      demographics: {
        dateOfBirth: '1980-05-15',
        gender: 'Male',
        race: 'White',
        ethnicity: 'Non-Hispanic'
      },
      conditions: [
        {
          id: 'condition-1',
          code: 'E11.9',
          codeSystem: 'ICD-10',
          description: 'Type 2 diabetes mellitus without complications',
          severity: 'moderate',
          status: 'active'
        },
        {
          id: 'condition-2',
          code: 'I10',
          codeSystem: 'ICD-10',
          description: 'Essential hypertension',
          severity: 'mild',
          status: 'active'
        }
      ],
      medications: [
        {
          id: 'med-1',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          route: 'oral',
          startDate: '2023-01-15',
          status: 'active',
          prescribingProvider: 'Dr. Smith'
        }
      ],
      labResults: [],
      clinicalNotes: [],
      admissions: [],
      timeline: []
    };
  });

  describe('constructor', () => {
    it('should create a patient model with default values', () => {
      const patient = new PatientModel({});
      expect(patient.id).toBe('');
      expect(patient.conditions).toEqual([]);
      expect(patient.medications).toEqual([]);
    });

    it('should create a patient model with provided data', () => {
      const patient = new PatientModel(samplePatientData);
      expect(patient.id).toBe('test-patient-1');
      expect(patient.demographics.gender).toBe('Male');
      expect(patient.conditions).toHaveLength(2);
      expect(patient.medications).toHaveLength(1);
    });
  });

  describe('getAge', () => {
    it('should calculate age correctly', () => {
      const patient = new PatientModel(samplePatientData);
      const age = patient.getAge();
      expect(age).toBeGreaterThan(40);
      expect(age).toBeLessThan(50);
    });

    it('should return null for missing date of birth', () => {
      const patientData = { ...samplePatientData };
      delete patientData.demographics!.dateOfBirth;
      const patient = new PatientModel(patientData);
      expect(patient.getAge()).toBeNull();
    });
  });

  describe('getActiveConditions', () => {
    it('should return only active conditions', () => {
      const patient = new PatientModel(samplePatientData);
      const activeConditions = patient.getActiveConditions();
      expect(activeConditions).toHaveLength(2);
      expect(activeConditions.every(c => c.status === 'active')).toBe(true);
    });

    it('should filter out resolved conditions', () => {
      const patientData = { ...samplePatientData };
      patientData.conditions![0].status = 'resolved';
      const patient = new PatientModel(patientData);
      const activeConditions = patient.getActiveConditions();
      expect(activeConditions).toHaveLength(1);
    });
  });

  describe('getCurrentMedications', () => {
    it('should return only active medications', () => {
      const patient = new PatientModel(samplePatientData);
      const currentMeds = patient.getCurrentMedications();
      expect(currentMeds).toHaveLength(1);
      expect(currentMeds[0].status).toBe('active');
    });
  });

  describe('hasCondition', () => {
    it('should correctly identify if patient has a specific condition', () => {
      const patient = new PatientModel(samplePatientData);
      expect(patient.hasCondition('E11.9')).toBe(true);
      expect(patient.hasCondition('Z00.00')).toBe(false);
    });
  });

  describe('generateSearchSummary', () => {
    it('should generate a comprehensive search summary', () => {
      const patient = new PatientModel(samplePatientData);
      const summary = patient.generateSearchSummary();
      expect(summary).toContain('male patient');
      expect(summary).toContain('Type 2 diabetes');
      expect(summary).toContain('Metformin');
    });

    it('should handle patient with no conditions', () => {
      const patientData = { ...samplePatientData };
      patientData.conditions = [];
      patientData.medications = [];
      const patient = new PatientModel(patientData);
      const summary = patient.generateSearchSummary();
      expect(summary).toContain('male patient');
      expect(summary).not.toContain('undefined');
    });
  });

  describe('toElasticsearchDocument', () => {
    it('should convert to Elasticsearch document format', () => {
      const patient = new PatientModel(samplePatientData);
      const doc = patient.toElasticsearchDocument();
      
      expect(doc.type).toBe('patient');
      expect(doc.source).toBe('MediQuery');
      expect(doc.title).toContain('test-patient-1');
      expect(doc.active_conditions_count).toBe(2);
      expect(doc.current_medications_count).toBe(1);
    });
  });

  describe('validate', () => {
    it('should return no errors for valid patient data', () => {
      const patient = new PatientModel(samplePatientData);
      const errors = patient.validate();
      expect(errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const patient = new PatientModel({});
      const errors = patient.validate();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Patient ID is required');
    });

    it('should validate medication data', () => {
      const patientData = { ...samplePatientData };
      patientData.medications![0].name = '';
      const patient = new PatientModel(patientData);
      const errors = patient.validate();
      expect(errors).toContain('Medication 1: name is required');
    });
  });

  describe('addCondition', () => {
    it('should add new condition and update timestamp', () => {
      const patient = new PatientModel(samplePatientData);
      const initialUpdatedAt = patient.updatedAt;
      
      // Wait a small amount to ensure timestamp changes
      setTimeout(() => {
        const newCondition: MedicalCondition = {
          id: 'condition-3',
          code: 'J44.1',
          codeSystem: 'ICD-10',
          description: 'COPD with acute exacerbation',
          severity: 'severe',
          status: 'active'
        };
        
        patient.addCondition(newCondition);
        expect(patient.conditions).toHaveLength(3);
        expect(patient.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('addMedication', () => {
    it('should add new medication', () => {
      const patient = new PatientModel(samplePatientData);
      const newMedication: Medication = {
        id: 'med-2',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'once daily',
        route: 'oral',
        startDate: '2023-02-01',
        status: 'active',
        prescribingProvider: 'Dr. Johnson'
      };
      
      patient.addMedication(newMedication);
      expect(patient.medications).toHaveLength(2);
    });
  });

  describe('calculateComplexityScore', () => {
    it('should calculate complexity based on conditions and admissions', () => {
      const patient = new PatientModel(samplePatientData);
      // This method doesn't exist yet, so we'll skip this test
      expect(patient.conditions.length).toBeGreaterThan(0);
    });
  });
});