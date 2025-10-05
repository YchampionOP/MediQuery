import elasticsearchService from './src/services/elasticsearch';

// Generate additional realistic patient data
async function generatePatientData() {
  console.log('👥 Generating Additional Patient Data...');
  
  try {
    const patients: any[] = [];
    
    // Generate 50 additional realistic patients
    for (let i = 1; i <= 50; i++) {
      const patientId = (20000 + i).toString();
      const gender = Math.random() > 0.5 ? 'M' : 'F';
      const birthYear = 1940 + Math.floor(Math.random() * 60); // Ages 23-83
      const currentYear = 2023;
      const age = currentYear - birthYear;
      
      // Random admission data
      const admissionTypes = ['EMERGENCY', 'ELECTIVE', 'URGENT', 'NEWBORN'];
      const admissionLocations = ['EMERGENCY ROOM ADMIT', 'CLINIC REFERRAL', 'PHYSICIAN REFERRAL', 'TRANSFER FROM HOSP/EXTRAM'];
      const dischargeLocations = ['HOME', 'HOME HEALTH CARE', 'SNF', 'REHAB/DISTINCT PART HOSP'];
      const insuranceTypes = ['Medicare', 'Private', 'Medicaid', 'Government'];
      const ethnicities = ['WHITE', 'BLACK/AFRICAN AMERICAN', 'HISPANIC/LATINO', 'ASIAN', 'OTHER'];
      const maritalStatuses = ['MARRIED', 'SINGLE', 'DIVORCED', 'WIDOWED'];
      
      // Common medical conditions
      const conditions = [
        { icd9: '401.9', icd10: 'I10', description: 'Hypertension' },
        { icd9: '250.00', icd10: 'E11.9', description: 'Type 2 diabetes mellitus' },
        { icd9: '272.4', icd10: 'E78.5', description: 'Hyperlipidemia' },
        { icd9: '427.31', icd10: 'I48.91', description: 'Atrial fibrillation' },
        { icd9: '428.0', icd10: 'I50.9', description: 'Heart failure' },
        { icd9: '496', icd10: 'J44.9', description: 'COPD' },
        { icd9: '530.81', icd10: 'K21.9', description: 'GERD' },
        { icd9: '715.90', icd10: 'M19.90', description: 'Osteoarthritis' }
      ];
      
      const numConditions = Math.floor(Math.random() * 3) + 1; // 1-3 conditions
      const patientConditions = [];
      const selectedConditions: string[] = [];
      
      for (let j = 0; j < numConditions; j++) {
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        if (!selectedConditions.includes(condition.description)) {
          selectedConditions.push(condition.description);
          patientConditions.push({
            icd9_code: condition.icd9,
            icd10_code: condition.icd10,
            description: condition.description,
            diagnosis_time: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
          });
        }
      }
      
      // Generate admission history (1-3 admissions)
      const numAdmissions = Math.floor(Math.random() * 3) + 1;
      const admissions = [];
      
      for (let k = 0; k < numAdmissions; k++) {
        const admitDate = new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const dischargeDate = new Date(admitDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000); // 1-7 days later
        
        admissions.push({
          admission_id: `${patientId}_${k + 1}`,
          admission_time: admitDate.toISOString(),
          discharge_time: dischargeDate.toISOString(),
          admission_type: admissionTypes[Math.floor(Math.random() * admissionTypes.length)],
          admission_location: admissionLocations[Math.floor(Math.random() * admissionLocations.length)],
          discharge_location: dischargeLocations[Math.floor(Math.random() * dischargeLocations.length)],
          insurance: insuranceTypes[Math.floor(Math.random() * insuranceTypes.length)],
          language: 'ENGLISH',
          religion: ['CATHOLIC', 'PROTESTANT', 'JEWISH', 'NOT SPECIFIED'][Math.floor(Math.random() * 4)],
          marital_status: maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)],
          ethnicity: ethnicities[Math.floor(Math.random() * ethnicities.length)],
          diagnosis: selectedConditions.join(', '),
          hospital_expire_flag: false
        });
      }
      
      const patient = {
        patient_id: patientId,
        subject_id: patientId,
        demographics: {
          gender: gender,
          date_of_birth: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          date_of_death: null
        },
        gender: gender.toLowerCase(),
        age: age,
        admissions: admissions,
        conditions: patientConditions,
        created_at: new Date().toISOString(),
        searchable_text: `Patient ${patientId} ${gender} age ${age} ${selectedConditions.join(' ')} ${admissions.map(a => a.diagnosis).join(' ')}`
      };
      
      patients.push(patient);
    }
    
    console.log(`Generated ${patients.length} additional patients`);
    
    // Bulk upload patients
    await bulkUploadPatients(patients);
    
    // Verify upload
    const finalCount = await elasticsearchService.search({
      index: 'patients',
      size: 0,
      query: { match_all: {} }
    });
    
    const totalPatients = finalCount.hits.total.value || finalCount.hits.total;
    console.log(`✅ Total patients in index: ${totalPatients}`);
    
    // Test search
    console.log('\n🔍 Testing patient search...');
    const searchResult = await elasticsearchService.hybridSearch({
      query: 'diabetes hypertension',
      indices: ['patients'],
      size: 5
    });
    
    console.log(`Found ${searchResult.hits.length} results for \"diabetes hypertension\":`);
    searchResult.hits.forEach((hit: any, index: number) => {
      const patient = hit.source;
      console.log(`  ${index + 1}. Patient ${patient.patient_id} (${patient.gender}, age ${patient.age}) - Score: ${hit.score.toFixed(2)}`);
      console.log(`     Conditions: ${patient.conditions?.map((c: any) => c.description).join(', ') || 'None listed'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to generate patient data:', error);
  }
}

async function bulkUploadPatients(patients: any[]): Promise<void> {
  const batchSize = 50;
  
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    const operations: any[] = [];
    
    batch.forEach(patient => {
      operations.push({ index: { _index: 'patients', _id: patient.patient_id } });
      operations.push(patient);
    });
    
    try {
      await elasticsearchService.bulkIndex(operations);
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1} (${batch.length} patients)`);
    } catch (error) {
      console.error(`❌ Failed to upload batch:`, error);
      throw error;
    }
  }
}

generatePatientData().catch(console.error);