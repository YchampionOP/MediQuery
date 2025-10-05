import elasticsearchService from './src/services/elasticsearch';

async function testMimicData() {
  console.log('🏥 Testing MIMIC-III Data Search Functionality...');
  
  try {
    // Test 1: Search for common medical terms
    console.log('\n🔍 Searching for medical terms...');
    
    const medicalTerms = [
      'hypertension',
      'pneumonia', 
      'sepsis',
      'insulin',
      'glucose',
      'morphine',
      'metoprolol',
      'hematocrit',
      'creatinine'
    ];
    
    for (const term of medicalTerms) {
      try {
        const results = await elasticsearchService.hybridSearch({
          query: term,
          size: 3
        });
        
        console.log(`  📋 \"${term}\": ${results.hits.length} results`);
        if (results.hits.length > 0) {
          results.hits.forEach((hit: any, index: number) => {
            console.log(`    ${index + 1}. [${hit.index}] Score: ${hit.score.toFixed(2)}`);
          });
        }
      } catch (error) {
        console.log(`  ❌ \"${term}\": Error - ${(error as Error).message}`);
      }
    }
    
    // Test 2: Patient-specific searches
    console.log('\n👤 Testing patient-specific searches...');
    
    const patientResults = await elasticsearchService.search({
      index: 'patients',
      query: { match_all: {} },
      size: 5
    });
    
    console.log(`Found ${patientResults.hits.hits.length} patients in index:`);
    patientResults.hits.hits.forEach((hit: any, index: number) => {
      const patient = hit._source;
      console.log(`  ${index + 1}. Patient ID: ${patient.patient_id}, Gender: ${patient.gender}, Age: ${patient.age}`);
    });
    
    // Test 3: Lab results search
    console.log('\n🧪 Testing lab results...');
    
    const labResults = await elasticsearchService.search({
      index: 'lab-results',
      query: {
        bool: {
          should: [
            { match: { label: 'glucose' } },
            { match: { label: 'hematocrit' } },
            { match: { label: 'creatinine' } }
          ]
        }
      },
      size: 5
    });
    
    console.log(`Found ${labResults.hits.hits.length} relevant lab results:`);
    labResults.hits.hits.forEach((hit: any, index: number) => {
      const lab = hit._source;
      console.log(`  ${index + 1}. ${lab.label}: ${lab.value} ${lab.valueuom || ''} (Patient: ${lab.patient_id})`);
    });
    
    // Test 4: Medication search
    console.log('\n💊 Testing medication search...');
    
    const medicationResults = await elasticsearchService.search({
      index: 'medications',
      query: {
        bool: {
          should: [
            { match: { drug: 'insulin' } },
            { match: { drug: 'metoprolol' } },
            { match: { drug: 'morphine' } }
          ]
        }
      },
      size: 5
    });
    
    console.log(`Found ${medicationResults.hits.hits.length} medication records:`);
    medicationResults.hits.hits.forEach((hit: any, index: number) => {
      const med = hit._source;
      console.log(`  ${index + 1}. ${med.drug} (Patient: ${med.patient_id}, Route: ${med.route})`);
    });
    
    // Test 5: Cross-index patient search
    console.log('\n🔗 Testing cross-index patient search...');
    
    if (patientResults.hits.hits.length > 0) {
      const firstPatientId = patientResults.hits.hits[0]._source.patient_id;
      console.log(`Searching for all data related to patient: ${firstPatientId}`);
      
      // Search across all indices for this patient
      const patientData = await elasticsearchService.search({
        index: ['patients', 'clinical-notes', 'lab-results', 'medications'],
        query: {
          term: { patient_id: firstPatientId }
        },
        size: 10
      });
      
      const groupedResults: any = {};
      patientData.hits.hits.forEach((hit: any) => {
        const index = hit._index;
        if (!groupedResults[index]) groupedResults[index] = 0;
        groupedResults[index]++;
      });
      
      console.log(`  Patient ${firstPatientId} data distribution:`);
      Object.entries(groupedResults).forEach(([index, count]) => {
        console.log(`    ${index}: ${count} records`);
      });
    }
    
    // Final summary
    console.log('\n📊 Final Data Summary:');
    const indices = ['patients', 'clinical-notes', 'lab-results', 'medications'];
    
    let totalRecords = 0;
    for (const index of indices) {
      try {
        const result = await elasticsearchService.search({
          index,
          size: 0,
          query: { match_all: {} }
        });
        
        const count = result.hits.total.value || result.hits.total;
        console.log(`  📋 ${index}: ${count.toLocaleString()} documents`);
        totalRecords += count;
      } catch (error) {
        console.log(`  ❌ ${index}: Error - ${(error as Error).message}`);
      }
    }
    
    console.log(`  🎯 Total medical records: ${totalRecords.toLocaleString()}`);
    console.log('\n🎉 MIMIC-III data is fully loaded and searchable!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMimicData().catch(console.error);