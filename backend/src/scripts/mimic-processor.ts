import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { elasticsearchService, INDICES } from '../services/elasticsearch';
import { logger } from '../utils/logger';

interface PatientRecord {
  subject_id: string;
  gender: string;
  dob: string;
  dod?: string;
  hadm_id?: string;
  admittime?: string;
  dischtime?: string;
  admission_type?: string;
  admission_location?: string;
  discharge_location?: string;
  insurance?: string;
  language?: string;
  religion?: string;
  marital_status?: string;
  ethnicity?: string;
  diagnosis?: string;
  hospital_expire_flag?: boolean;
}

interface ClinicalNote {
  row_id: string;
  subject_id: string;
  hadm_id: string;
  chartdate: string;
  charttime?: string;
  storetime?: string;
  category: string;
  description: string;
  cgid?: string;
  iserror?: boolean;
  text: string;
}

interface LabEvent {
  row_id: string;
  subject_id: string;
  hadm_id: string;
  itemid: string;
  charttime: string;
  storetime?: string;
  cgid?: string;
  value?: string;
  valuenum?: number;
  valueuom?: string;
  flag?: string;
}

interface Prescription {
  row_id: string;
  subject_id: string;
  hadm_id: string;
  icustay_id?: string;
  startdate: string;
  enddate?: string;
  drug_type: string;
  drug: string;
  drug_name_poe?: string;
  drug_name_generic?: string;
  formulary_drug_cd?: string;
  gsn?: string;
  ndc?: string;
  prod_strength?: string;
  dose_val_rx?: string;
  dose_unit_rx?: string;
  form_val_disp?: string;
  form_unit_disp?: string;
  route?: string;
}

class MimicDataProcessor {
  private dataPath: string;
  private batchSize: number = 1000;

  constructor(dataPath: string) {
    this.dataPath = dataPath;
  }

  async processAllData(): Promise<void> {
    logger.info('🚀 Starting MIMIC-III data processing...');
    
    try {
      // Process patients first
      await this.processPatients();
      
      // Process clinical notes
      await this.processClinicalNotes();
      
      // Process lab events
      await this.processLabEvents();
      
      // Process prescriptions
      await this.processPrescriptions();
      
      logger.info('✅ MIMIC-III data processing completed successfully');
    } catch (error) {
      logger.error('❌ MIMIC-III data processing failed:', error);
      throw error;
    }
  }

  private async processPatients(): Promise<void> {
    logger.info('📋 Processing patients data...');
    
    const patientsFile = path.join(this.dataPath, 'PATIENTS.csv');
    const admissionsFile = path.join(this.dataPath, 'ADMISSIONS.csv');
    
    // Check if files exist
    if (!fs.existsSync(patientsFile)) {
      logger.warn(`Patients file not found: ${patientsFile}`);
      return;
    }
    
    const patients = new Map<string, any>();
    const admissions = new Map<string, any[]>();
    
    // Read patients file
    await this.readCSV(patientsFile, (row: any) => {
      const patient = {
        patient_id: row.SUBJECT_ID,
        demographics: {
          gender: row.GENDER,
          date_of_birth: row.DOB,
          date_of_death: row.DOD || null
        },
        age: this.calculateAge(row.DOB, row.DOD),
        admissions: [],
        conditions: [],
        created_at: new Date().toISOString(),
        searchable_text: `Patient ${row.SUBJECT_ID} ${row.GENDER}`
      };
      
      patients.set(row.SUBJECT_ID, patient);
    });
    
    // Read admissions if available
    if (fs.existsSync(admissionsFile)) {
      await this.readCSV(admissionsFile, (row: any) => {
        const admission = {
          admission_id: row.HADM_ID,
          admission_time: row.ADMITTIME,
          discharge_time: row.DISCHTIME,
          admission_type: row.ADMISSION_TYPE,
          admission_location: row.ADMISSION_LOCATION,
          discharge_location: row.DISCHARGE_LOCATION,
          insurance: row.INSURANCE,
          language: row.LANGUAGE,
          religion: row.RELIGION,
          marital_status: row.MARITAL_STATUS,
          ethnicity: row.ETHNICITY,
          diagnosis: row.DIAGNOSIS,
          hospital_expire_flag: row.HOSPITAL_EXPIRE_FLAG === '1'
        };
        
        if (!admissions.has(row.SUBJECT_ID)) {
          admissions.set(row.SUBJECT_ID, []);
        }
        admissions.get(row.SUBJECT_ID)!.push(admission);
      });
    }
    
    // Merge admissions with patients
    for (const [patientId, patientAdmissions] of admissions.entries()) {
      if (patients.has(patientId)) {
        const patient = patients.get(patientId);
        patient.admissions = patientAdmissions;
        patient.searchable_text += ` ${patientAdmissions.map(a => a.diagnosis).join(' ')}`;
        patients.set(patientId, patient);
      }
    }
    
    // Bulk index patients
    await this.bulkIndexData(INDICES.PATIENTS, Array.from(patients.values()));
    logger.info(`✅ Processed ${patients.size} patients`);
  }

  private async processClinicalNotes(): Promise<void> {
    logger.info('📝 Processing clinical notes...');
    
    const notesFile = path.join(this.dataPath, 'NOTEEVENTS.csv');
    
    if (!fs.existsSync(notesFile)) {
      logger.warn(`Notes file not found: ${notesFile}`);
      return;
    }
    
    const notes: any[] = [];
    
    await this.readCSV(notesFile, (row: any) => {
      const note = {
        note_id: row.ROW_ID,
        patient_id: row.SUBJECT_ID,
        hadm_id: row.HADM_ID,
        chartdate: row.CHARTDATE,
        charttime: row.CHARTTIME,
        storetime: row.STORETIME,
        category: row.CATEGORY,
        description: row.DESCRIPTION,
        cgid: row.CGID,
        iserror: row.ISERROR === '1',
        text: row.TEXT || '',
        note_type: row.CATEGORY,
        created_at: new Date().toISOString(),
        searchable_text: `${row.CATEGORY} ${row.DESCRIPTION} ${row.TEXT || ''}`.substring(0, 5000)
      };
      
      notes.push(note);
      
      if (notes.length >= this.batchSize) {
        this.bulkIndexData(INDICES.CLINICAL_NOTES, notes.splice(0, this.batchSize));
      }
    });
    
    // Index remaining notes
    if (notes.length > 0) {
      await this.bulkIndexData(INDICES.CLINICAL_NOTES, notes);
    }
    
    logger.info(`✅ Processed clinical notes`);
  }

  private async processLabEvents(): Promise<void> {
    logger.info('🧪 Processing lab events...');
    
    const labFile = path.join(this.dataPath, 'LABEVENTS.csv');
    const itemsFile = path.join(this.dataPath, 'D_LABITEMS.csv');
    
    if (!fs.existsSync(labFile)) {
      logger.warn(`Lab events file not found: ${labFile}`);
      return;
    }
    
    // Load lab item descriptions
    const labItems = new Map<string, any>();
    if (fs.existsSync(itemsFile)) {
      await this.readCSV(itemsFile, (row: any) => {
        labItems.set(row.ITEMID, {
          label: row.LABEL,
          fluid: row.FLUID,
          category: row.CATEGORY,
          loinc_code: row.LOINC_CODE
        });
      });
    }
    
    const labEvents: any[] = [];
    
    await this.readCSV(labFile, (row: any) => {
      const itemInfo = labItems.get(row.ITEMID) || {};
      
      const labEvent = {
        lab_id: row.ROW_ID,
        patient_id: row.SUBJECT_ID,
        hadm_id: row.HADM_ID,
        itemid: row.ITEMID,
        charttime: row.CHARTTIME,
        storetime: row.STORETIME,
        value: row.VALUE,
        valuenum: row.VALUENUM ? parseFloat(row.VALUENUM) : null,
        valueuom: row.VALUEUOM,
        flag: row.FLAG,
        label: itemInfo.label || 'Unknown Lab',
        fluid: itemInfo.fluid,
        category: itemInfo.category,
        loinc_code: itemInfo.loinc_code,
        created_at: new Date().toISOString(),
        searchable_text: `${itemInfo.label || 'Unknown Lab'} ${row.VALUE || ''} ${row.VALUEUOM || ''}`
      };
      
      labEvents.push(labEvent);
      
      if (labEvents.length >= this.batchSize) {
        this.bulkIndexData(INDICES.LAB_RESULTS, labEvents.splice(0, this.batchSize));
      }
    });
    
    // Index remaining lab events
    if (labEvents.length > 0) {
      await this.bulkIndexData(INDICES.LAB_RESULTS, labEvents);
    }
    
    logger.info(`✅ Processed lab events`);
  }

  private async processPrescriptions(): Promise<void> {
    logger.info('💊 Processing prescriptions...');
    
    const prescriptionsFile = path.join(this.dataPath, 'PRESCRIPTIONS.csv');
    
    if (!fs.existsSync(prescriptionsFile)) {
      logger.warn(`Prescriptions file not found: ${prescriptionsFile}`);
      return;
    }
    
    const prescriptions: any[] = [];
    
    await this.readCSV(prescriptionsFile, (row: any) => {
      const prescription = {
        prescription_id: row.ROW_ID,
        patient_id: row.SUBJECT_ID,
        hadm_id: row.HADM_ID,
        icustay_id: row.ICUSTAY_ID,
        startdate: row.STARTDATE,
        enddate: row.ENDDATE,
        drug_type: row.DRUG_TYPE,
        drug: row.DRUG,
        drug_name_poe: row.DRUG_NAME_POE,
        drug_name_generic: row.DRUG_NAME_GENERIC,
        formulary_drug_cd: row.FORMULARY_DRUG_CD,
        gsn: row.GSN,
        ndc: row.NDC,
        prod_strength: row.PROD_STRENGTH,
        dose_val_rx: row.DOSE_VAL_RX,
        dose_unit_rx: row.DOSE_UNIT_RX,
        form_val_disp: row.FORM_VAL_DISP,
        form_unit_disp: row.FORM_UNIT_DISP,
        route: row.ROUTE,
        created_at: new Date().toISOString(),
        searchable_text: `${row.DRUG} ${row.DRUG_NAME_GENERIC || ''} ${row.ROUTE || ''}`
      };
      
      prescriptions.push(prescription);
      
      if (prescriptions.length >= this.batchSize) {
        this.bulkIndexData(INDICES.MEDICATIONS, prescriptions.splice(0, this.batchSize));
      }
    });
    
    // Index remaining prescriptions
    if (prescriptions.length > 0) {
      await this.bulkIndexData(INDICES.MEDICATIONS, prescriptions);
    }
    
    logger.info(`✅ Processed prescriptions`);
  }

  private async readCSV(filePath: string, callback: (row: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      let rowCount = 0;
      const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            callback(row);
            rowCount++;
            if (rowCount % 10000 === 0) {
              logger.info(`Processed ${rowCount} rows from ${path.basename(filePath)}`);
            }
          } catch (error) {
            logger.error(`Error processing row ${rowCount}:`, error);
          }
        })
        .on('end', () => {
          logger.info(`Finished reading ${rowCount} rows from ${path.basename(filePath)}`);
          resolve();
        })
        .on('error', reject);
    });
  }

  private async bulkIndexData(index: string, data: any[]): Promise<void> {
    if (data.length === 0) return;
    
    const operations: any[] = [];
    
    data.forEach(doc => {
      operations.push({ index: { _index: index, _id: doc.patient_id || doc.note_id || doc.lab_id || doc.prescription_id } });
      operations.push(doc);
    });
    
    try {
      await elasticsearchService.bulkIndex(operations);
      logger.info(`📝 Indexed ${data.length} documents to ${index}`);
    } catch (error) {
      logger.error(`Failed to index data to ${index}:`, error);
      throw error;
    }
  }

  private calculateAge(dob: string, dod?: string): number {
    const birthDate = new Date(dob);
    const endDate = dod ? new Date(dod) : new Date();
    const age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  }
}

// Export for use in other modules
export { MimicDataProcessor };

// CLI execution
if (require.main === module) {
  const dataPath = process.env.MIMIC_DATA_PATH || './data/mimic-iii-clinical-database-demo-1.4';
  
  const processor = new MimicDataProcessor(dataPath);
  processor.processAllData()
    .then(() => {
      logger.info('🎉 MIMIC-III data processing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 MIMIC-III data processing failed:', error);
      process.exit(1);
    });
}