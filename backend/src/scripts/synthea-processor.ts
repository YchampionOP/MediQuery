import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import elasticsearchService from '../services/elasticsearch';

interface SyntheaPatient {
  Id: string;
  BIRTHDATE: string;
  DEATHDATE?: string;
  SSN: string;
  DRIVERS: string;
  PASSPORT: string;
  PREFIX?: string;
  FIRST: string;
  LAST: string;
  SUFFIX?: string;
  MAIDEN?: string;
  MARITAL?: string;
  RACE: string;
  ETHNICITY: string;
  GENDER: string;
  BIRTHPLACE: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  COUNTY: string;
  ZIP: string;
  LAT: string;
  LON: string;
  HEALTHCARE_EXPENSES: string;
  HEALTHCARE_COVERAGE: string;
}

interface SyntheaEncounter {
  Id: string;
  START: string;
  STOP?: string;
  PATIENT: string;
  ORGANIZATION: string;
  PROVIDER: string;
  PAYER: string;
  ENCOUNTERCLASS: string;
  CODE: string;
  DESCRIPTION: string;
  BASE_ENCOUNTER_COST: string;
  TOTAL_CLAIM_COST: string;
  PAYER_COVERAGE: string;
  REASONCODE?: string;
  REASONDESCRIPTION?: string;
}

interface SyntheaCondition {
  START: string;
  STOP?: string;
  PATIENT: string;
  ENCOUNTER: string;
  CODE: string;
  DESCRIPTION: string;
}

interface SyntheaMedication {
  START: string;
  STOP?: string;
  PATIENT: string;
  PAYER: string;
  ENCOUNTER: string;
  CODE: string;
  DESCRIPTION: string;
  BASE_COST: string;
  PAYER_COVERAGE: string;
  DISPENSES: string;
  TOTALCOST: string;
  REASONCODE?: string;
  REASONDESCRIPTION?: string;
}

interface SyntheaObservation {
  DATE: string;
  PATIENT: string;
  ENCOUNTER: string;
  CATEGORY: string;
  CODE: string;
  DESCRIPTION: string;
  VALUE: string;
  UNITS: string;
  TYPE: string;
}

interface SyntheaProcedure {
  DATE: string;
  PATIENT: string;
  ENCOUNTER: string;
  CODE: string;
  DESCRIPTION: string;
  BASE_COST: string;
  REASONCODE?: string;
  REASONDESCRIPTION?: string;
}

class SyntheaDataProcessor {
  private dataPath: string;

  constructor(dataPath: string) {
    this.dataPath = dataPath;
  }

  async processAllData(): Promise<void> {
    console.log('Starting Synthea data processing...');
    
    try {
      await this.processPatients();
      await this.processClinicalNotes();
      await this.processLabResults();
      await this.processMedications();
      
      console.log('Synthea data processing completed successfully!');
    } catch (error) {
      console.error('Error processing Synthea data:', error);
      throw error;
    }
  }

  private async processPatients(): Promise<void> {
    console.log('Processing Synthea patients...');
    
    const patientsFile = path.join(this.dataPath, 'patients.csv');
    const encountersFile = path.join(this.dataPath, 'encounters.csv');
    
    if (!fs.existsSync(patientsFile)) {
      console.warn('Synthea patients.csv not found, skipping patient processing');
      return;
    }

    const patients: any[] = [];
    const encounters = await this.loadEncounters();

    return new Promise((resolve, reject) => {
      createReadStream(patientsFile)
        .pipe(csv())
        .on('data', (row: SyntheaPatient) => {
          try {
            const patientEncounters = encounters.filter(enc => enc.PATIENT === row.Id);
            
            const patient = {
              patient_id: row.Id,
              gender: row.GENDER?.toLowerCase(),
              birth_date: row.BIRTHDATE,
              death_date: row.DEATHDATE || null,
              race: row.RACE,
              ethnicity: row.ETHNICITY,
              marital_status: row.MARITAL,
              address: {
                street: row.ADDRESS,
                city: row.CITY,
                state: row.STATE,
                zip: row.ZIP,
                country: 'USA'
              },
              demographics: {
                first_name: row.FIRST,
                last_name: row.LAST,
                prefix: row.PREFIX,
                suffix: row.SUFFIX,
                maiden_name: row.MAIDEN,
                ssn: row.SSN,
                drivers_license: row.DRIVERS,
                passport: row.PASSPORT
              },
              location: {
                lat: parseFloat(row.LAT),
                lon: parseFloat(row.LON)
              },
              healthcare: {
                expenses: parseFloat(row.HEALTHCARE_EXPENSES || '0'),
                coverage: parseFloat(row.HEALTHCARE_COVERAGE || '0')
              },
              admission_history: patientEncounters.map(enc => ({
                encounter_id: enc.Id,
                admission_date: enc.START,
                discharge_date: enc.STOP,
                encounter_class: enc.ENCOUNTERCLASS,
                description: enc.DESCRIPTION,
                provider: enc.PROVIDER,
                organization: enc.ORGANIZATION,
                total_cost: parseFloat(enc.TOTAL_CLAIM_COST || '0'),
                reason_code: enc.REASONCODE,
                reason_description: enc.REASONDESCRIPTION
              })),
              created_at: new Date().toISOString(),
              data_source: 'synthea'
            };

            patients.push(patient);
          } catch (error) {
            console.error('Error processing patient row:', error, row);
          }
        })
        .on('end', async () => {
          try {
            console.log(`Processed ${patients.length} Synthea patients`);
            await this.bulkIndexData('patients', patients);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private async loadEncounters(): Promise<SyntheaEncounter[]> {
    const encountersFile = path.join(this.dataPath, 'encounters.csv');
    
    if (!fs.existsSync(encountersFile)) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const encounters: SyntheaEncounter[] = [];
      
      createReadStream(encountersFile)
        .pipe(csv())
        .on('data', (row: SyntheaEncounter) => {
          encounters.push(row);
        })
        .on('end', () => resolve(encounters))
        .on('error', reject);
    });
  }

  private async processClinicalNotes(): Promise<void> {
    console.log('Processing Synthea clinical notes...');
    
    // Synthea doesn't directly provide clinical notes, so we'll generate them
    // from conditions, procedures, and observations
    const conditionsFile = path.join(this.dataPath, 'conditions.csv');
    const proceduresFile = path.join(this.dataPath, 'procedures.csv');
    
    const notes: any[] = [];
    
    // Process conditions as clinical notes
    if (fs.existsSync(conditionsFile)) {
      await new Promise<void>((resolve, reject) => {
        createReadStream(conditionsFile)
          .pipe(csv())
          .on('data', (row: SyntheaCondition) => {
            try {
              const note = {
                note_id: `condition_${row.PATIENT}_${row.START}`,
                patient_id: row.PATIENT,
                encounter_id: row.ENCOUNTER,
                note_type: 'Condition',
                category: 'diagnosis',
                date: row.START,
                text: `Patient diagnosed with ${row.DESCRIPTION} (Code: ${row.CODE})`,
                structured_data: {
                  condition_code: row.CODE,
                  condition_description: row.DESCRIPTION,
                  start_date: row.START,
                  end_date: row.STOP
                },
                provider_id: null,
                created_at: new Date().toISOString(),
                data_source: 'synthea'
              };
              
              notes.push(note);
            } catch (error) {
              console.error('Error processing condition row:', error, row);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    // Process procedures as clinical notes
    if (fs.existsSync(proceduresFile)) {
      await new Promise<void>((resolve, reject) => {
        createReadStream(proceduresFile)
          .pipe(csv())
          .on('data', (row: SyntheaProcedure) => {
            try {
              const note = {
                note_id: `procedure_${row.PATIENT}_${row.DATE}`,
                patient_id: row.PATIENT,
                encounter_id: row.ENCOUNTER,
                note_type: 'Procedure',
                category: 'procedure',
                date: row.DATE,
                text: `Procedure performed: ${row.DESCRIPTION} (Code: ${row.CODE}). Cost: $${row.BASE_COST}`,
                structured_data: {
                  procedure_code: row.CODE,
                  procedure_description: row.DESCRIPTION,
                  date: row.DATE,
                  cost: parseFloat(row.BASE_COST || '0'),
                  reason_code: row.REASONCODE,
                  reason_description: row.REASONDESCRIPTION
                },
                provider_id: null,
                created_at: new Date().toISOString(),
                data_source: 'synthea'
              };
              
              notes.push(note);
            } catch (error) {
              console.error('Error processing procedure row:', error, row);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    console.log(`Processed ${notes.length} Synthea clinical notes`);
    await this.bulkIndexData('clinical-notes', notes);
  }

  private async processLabResults(): Promise<void> {
    console.log('Processing Synthea lab results...');
    
    const observationsFile = path.join(this.dataPath, 'observations.csv');
    
    if (!fs.existsSync(observationsFile)) {
      console.warn('Synthea observations.csv not found, skipping lab results processing');
      return;
    }

    const labResults: any[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(observationsFile)
        .pipe(csv())
        .on('data', (row: SyntheaObservation) => {
          try {
            // Filter for lab-type observations
            if (row.CATEGORY === 'laboratory' || row.TYPE === 'numeric') {
              const labResult = {
                lab_id: `obs_${row.PATIENT}_${row.DATE}_${row.CODE}`,
                patient_id: row.PATIENT,
                encounter_id: row.ENCOUNTER,
                test_name: row.DESCRIPTION,
                test_code: row.CODE,
                value: row.VALUE,
                units: row.UNITS,
                reference_range: null, // Synthea doesn't provide reference ranges
                abnormal_flag: null,
                result_date: row.DATE,
                category: row.CATEGORY,
                status: 'final',
                structured_data: {
                  loinc_code: row.CODE,
                  value_type: row.TYPE,
                  observation_category: row.CATEGORY
                },
                created_at: new Date().toISOString(),
                data_source: 'synthea'
              };

              labResults.push(labResult);
            }
          } catch (error) {
            console.error('Error processing observation row:', error, row);
          }
        })
        .on('end', async () => {
          try {
            console.log(`Processed ${labResults.length} Synthea lab results`);
            await this.bulkIndexData('lab-results', labResults);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private async processMedications(): Promise<void> {
    console.log('Processing Synthea medications...');
    
    const medicationsFile = path.join(this.dataPath, 'medications.csv');
    
    if (!fs.existsSync(medicationsFile)) {
      console.warn('Synthea medications.csv not found, skipping medications processing');
      return;
    }

    const medications: any[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(medicationsFile)
        .pipe(csv())
        .on('data', (row: SyntheaMedication) => {
          try {
            const medication = {
              medication_id: `med_${row.PATIENT}_${row.START}_${row.CODE}`,
              patient_id: row.PATIENT,
              encounter_id: row.ENCOUNTER,
              drug_name: row.DESCRIPTION,
              drug_code: row.CODE,
              start_date: row.START,
              end_date: row.STOP,
              dosage: null, // Synthea doesn't provide detailed dosage info
              frequency: null,
              route: null,
              quantity: row.DISPENSES,
              cost: parseFloat(row.TOTALCOST || '0'),
              payer: row.PAYER,
              payer_coverage: parseFloat(row.PAYER_COVERAGE || '0'),
              reason_code: row.REASONCODE,
              reason_description: row.REASONDESCRIPTION,
              status: row.STOP ? 'completed' : 'active',
              structured_data: {
                base_cost: parseFloat(row.BASE_COST || '0'),
                dispenses: parseInt(row.DISPENSES || '0'),
                total_cost: parseFloat(row.TOTALCOST || '0')
              },
              created_at: new Date().toISOString(),
              data_source: 'synthea'
            };

            medications.push(medication);
          } catch (error) {
            console.error('Error processing medication row:', error, row);
          }
        })
        .on('end', async () => {
          try {
            console.log(`Processed ${medications.length} Synthea medications`);
            await this.bulkIndexData('medications', medications);
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private async bulkIndexData(index: string, data: any[]): Promise<void> {
    if (data.length === 0) {
      console.log(`No data to index for ${index}`);
      return;
    }

    const batchSize = 1000;
    const operations: any[] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchOps: any[] = [];

      batch.forEach(doc => {
        batchOps.push({ 
          index: { 
            _index: index, 
            _id: doc.patient_id || doc.note_id || doc.lab_id || doc.medication_id 
          } 
        });
        batchOps.push(doc);
      });

      try {
        await elasticsearchService.bulkIndex(batchOps);
        console.log(`Indexed batch ${Math.floor(i / batchSize) + 1} for ${index} (${batch.length} documents)`);
      } catch (error) {
        console.error(`Error indexing batch for ${index}:`, error);
        throw error;
      }
    }

    console.log(`Successfully indexed ${data.length} documents to ${index}`);
  }
}

export default SyntheaDataProcessor;