import path from 'path';
import fs from 'fs';
import { MimicDataProcessor } from './mimic-processor';
import SyntheaDataProcessor from './synthea-processor';
import elasticsearchService from '../services/elasticsearch';

class DataUploadManager {
  private mimicProcessor: MimicDataProcessor | null = null;
  private syntheaProcessor: SyntheaDataProcessor | null = null;

  constructor() {
    // Initialize processors if data directories exist
    this.initializeProcessors();
  }

  private initializeProcessors(): void {
    // Check for MIMIC-III data directory
    const mimicDataPath = path.join(process.cwd(), '..', 'mimic-iii-clinical-database-demo-1.4');
    const alternativeMimicPath = path.join(process.cwd(), 'data', 'mimic-iii');
    
    if (fs.existsSync(mimicDataPath)) {
      this.mimicProcessor = new MimicDataProcessor(mimicDataPath);
      console.log(`Found MIMIC-III data at: ${mimicDataPath}`);
    } else if (fs.existsSync(alternativeMimicPath)) {
      this.mimicProcessor = new MimicDataProcessor(alternativeMimicPath);
      console.log(`Found MIMIC-III data at: ${alternativeMimicPath}`);
    } else {
      console.warn('MIMIC-III data directory not found. Skipping MIMIC data processing.');
    }

    // Check for Synthea data directory
    const syntheaDataPath = path.join(process.cwd(), '..', 'data', 'synthea-master');
    const alternativeSyntheaPath = path.join(process.cwd(), 'data', 'synthea-master');
    const syntheaOutputPath = path.join(process.cwd(), '..', 'data', 'synthea-output');

    if (fs.existsSync(syntheaDataPath)) {
      this.syntheaProcessor = new SyntheaDataProcessor(syntheaDataPath);
      console.log(`Found Synthea data at: ${syntheaDataPath}`);
    } else if (fs.existsSync(alternativeSyntheaPath)) {
      this.syntheaProcessor = new SyntheaDataProcessor(alternativeSyntheaPath);
      console.log(`Found Synthea data at: ${alternativeSyntheaPath}`);
    } else if (fs.existsSync(syntheaOutputPath)) {
      this.syntheaProcessor = new SyntheaDataProcessor(syntheaOutputPath);
      console.log(`Found Synthea output data at: ${syntheaOutputPath}`);
    } else {
      console.warn('Synthea data directory not found. Skipping Synthea data processing.');
    }
  }

  async uploadAllData(): Promise<void> {
    console.log('='.repeat(60));
    console.log('STARTING COMPREHENSIVE DATA UPLOAD TO ELASTICSEARCH');
    console.log('='.repeat(60));

    try {
      // Test Elasticsearch connection first
      await this.testElasticsearchConnection();

      // Create sample data if no real data sources found
      if (!this.mimicProcessor && !this.syntheaProcessor) {
        console.log('No data sources found. Creating sample data...');
        await this.createSampleData();
        return;
      }

      // Process MIMIC-III data
      if (this.mimicProcessor) {
        console.log('\n📊 Processing MIMIC-III data...');
        await this.mimicProcessor.processAllData();
        console.log('✅ MIMIC-III data processing completed');
      }

      // Process Synthea data
      if (this.syntheaProcessor) {
        console.log('\n🏥 Processing Synthea data...');
        await this.syntheaProcessor.processAllData();
        console.log('✅ Synthea data processing completed');
      }

      console.log('\n🎉 ALL DATA UPLOAD COMPLETED SUCCESSFULLY!');
      await this.generateUploadSummary();

    } catch (error) {
      console.error('❌ Data upload failed:', error);
      throw error;
    }
  }

  private async testElasticsearchConnection(): Promise<void> {
    console.log('🔍 Testing Elasticsearch connection...');
    
    try {
      // Test basic ping first
      await elasticsearchService.testConnection();
      console.log('✅ Elasticsearch connection successful');
      
      // Skip cluster health check due to API compatibility issues
      console.log('   Skipping cluster health check (API compatibility)');
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error);
      throw new Error('Cannot proceed without Elasticsearch connection');
    }
  }

  private async createSampleData(): Promise<void> {
    console.log('Creating sample medical data for testing...');

    // Sample patients
    const samplePatients = [
      {
        patient_id: 'P001',
        demographics: {
          name: 'John Doe',
          date_of_birth: '1980-05-15',
          gender: 'male',
          race: 'white',
          ethnicity: 'not hispanic'
        },
        age: 43,
        conditions: [
          {
            icd9_code: '250.00',
            icd10_code: 'E11.9',
            description: 'Type 2 diabetes mellitus without complications',
            diagnosis_time: '2023-01-15'
          }
        ],
        searchable_text: 'John Doe male white diabetes mellitus type 2'
      },
      {
        patient_id: 'P002',
        demographics: {
          name: 'Jane Smith',
          date_of_birth: '1975-08-22',
          gender: 'female',
          race: 'black',
          ethnicity: 'not hispanic'
        },
        age: 48,
        conditions: [
          {
            icd9_code: '401.9',
            icd10_code: 'I10',
            description: 'Hypertension',
            diagnosis_time: '2022-11-10'
          }
        ],
        searchable_text: 'Jane Smith female black hypertension'
      }
    ];

    // Sample clinical notes
    const sampleNotes = [
      {
        note_id: 'N001',
        patient_id: 'P001',
        chartdate: '2023-06-15',
        category: 'Physician',
        text: 'Patient presents with well-controlled diabetes. HbA1c levels stable at 7.2%. Continue current medication regimen.',
        searchable_text: 'diabetes well controlled HbA1c stable medication regimen physician note'
      },
      {
        note_id: 'N002',
        patient_id: 'P002',
        chartdate: '2023-06-14',
        category: 'Nursing',
        text: 'Blood pressure monitoring shows readings of 140/90. Patient reports good medication compliance.',
        searchable_text: 'blood pressure monitoring 140/90 medication compliance nursing note'
      }
    ];

    // Sample lab results
    const sampleLabResults = [
      {
        lab_id: 'L001',
        patient_id: 'P001',
        itemid: 'GLU',
        charttime: '2023-06-15',
        value: '120',
        valuenum: 120,
        valueuom: 'mg/dL',
        label: 'Glucose',
        searchable_text: 'glucose 120 mg/dL lab result'
      },
      {
        lab_id: 'L002',
        patient_id: 'P002',
        itemid: 'SBP',
        charttime: '2023-06-14',
        value: '140',
        valuenum: 140,
        valueuom: 'mmHg',
        label: 'Systolic Blood Pressure',
        searchable_text: 'systolic blood pressure 140 mmHg lab result'
      }
    ];

    // Sample medications
    const sampleMedications = [
      {
        prescription_id: 'M001',
        patient_id: 'P001',
        drug: 'Metformin 500mg',
        startdate: '2023-01-15',
        enddate: '2023-12-31',
        route: 'Oral',
        frequency: 'Twice daily',
        searchable_text: 'metformin 500mg oral twice daily diabetes medication'
      },
      {
        prescription_id: 'M002',
        patient_id: 'P002',
        drug: 'Lisinopril 10mg',
        startdate: '2022-11-10',
        enddate: '2023-11-10',
        route: 'Oral',
        frequency: 'Once daily',
        searchable_text: 'lisinopril 10mg oral once daily hypertension medication'
      }
    ];

    // Upload sample data
    await this.bulkUploadToIndex('patients', samplePatients);
    await this.bulkUploadToIndex('clinical-notes', sampleNotes);
    await this.bulkUploadToIndex('lab-results', sampleLabResults);
    await this.bulkUploadToIndex('medications', sampleMedications);

    console.log('✅ Sample data created and uploaded successfully');
  }

  private async bulkUploadToIndex(indexName: string, data: any[]): Promise<void> {
    if (data.length === 0) {
      console.log(`No data to upload for ${indexName}`);
      return;
    }

    const operations: any[] = [];
    data.forEach(doc => {
      operations.push({ index: { _index: indexName } });
      operations.push(doc);
    });

    try {
      await elasticsearchService.bulkIndex(operations);
      console.log(`✅ Uploaded ${data.length} documents to ${indexName}`);
    } catch (error) {
      console.error(`❌ Failed to upload to ${indexName}:`, error);
      throw error;
    }
  }

  private async generateUploadSummary(): Promise<void> {
    console.log('\n📈 UPLOAD SUMMARY');
    console.log('='.repeat(40));

    const indices = ['patients', 'clinical-notes', 'lab-results', 'medications'];
    
    for (const index of indices) {
      try {
        const result = await elasticsearchService.search({
          index,
          size: 0,
          query: { match_all: {} }
        });
        
        const count = result.hits.total.value || result.hits.total;
        console.log(`${index}: ${count} documents`);
      } catch (error) {
        console.log(`${index}: Error retrieving count - ${(error as Error).message}`);
      }
    }

    console.log('='.repeat(40));
  }

  async testSearch(): Promise<void> {
    console.log('\n🔍 Testing search functionality...');

    try {
      // Test basic search
      const searchResult = await elasticsearchService.hybridSearch({
        query: 'diabetes',
        size: 5
      });

      console.log(`✅ Search test successful - found ${searchResult.hits.length} results`);
      
      if (searchResult.hits.length > 0) {
        console.log('Sample results:');
        searchResult.hits.forEach((hit: any, index: number) => {
          console.log(`  ${index + 1}. [${hit.index}] Score: ${hit.score.toFixed(2)}`);
        });
      }
    } catch (error) {
      console.error('❌ Search test failed:', error);
    }
  }
}

// Main execution function
async function main() {
  const uploadManager = new DataUploadManager();
  
  try {
    await uploadManager.uploadAllData();
    await uploadManager.testSearch();
  } catch (error) {
    console.error('Upload process failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default DataUploadManager;