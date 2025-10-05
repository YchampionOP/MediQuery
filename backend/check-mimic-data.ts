import elasticsearchService from './src/services/elasticsearch';

async function checkMimicData() {
  console.log('🔍 Checking MIMIC-III Data in Elasticsearch...');
  
  try {
    // Check raw data in each index
    const indices = ['patients', 'clinical-notes', 'lab-results', 'medications'];
    
    for (const index of indices) {
      console.log(`\n📋 Checking ${index} index:`);
      
      try {
        const result = await elasticsearchService.search({
          index,
          size: 3,
          query: { match_all: {} }
        });
        
        const count = result.hits.total.value || result.hits.total;
        console.log(`  Total documents: ${count}`);
        
        if (result.hits.hits.length > 0) {
          console.log(`  Sample documents:`);
          result.hits.hits.forEach((hit: any, i: number) => {
            console.log(`    ${i + 1}. ID: ${hit._id}`);
            console.log(`       Source keys: ${Object.keys(hit._source).join(', ')}`);
            
            if (index === 'patients') {
              const patient = hit._source;
              console.log(`       Patient ID: ${patient.patient_id || patient.subject_id}`);
              console.log(`       Gender: ${patient.gender}`);
              console.log(`       Age: ${patient.age}`);
            } else if (index === 'lab-results') {
              const lab = hit._source;
              console.log(`       Patient ID: ${lab.patient_id}`);
              console.log(`       Label: ${lab.label}`);
              console.log(`       Value: ${lab.value}`);
            } else if (index === 'medications') {
              const med = hit._source;
              console.log(`       Patient ID: ${med.patient_id}`);
              console.log(`       Drug: ${med.drug}`);
            }
          });
        }
      } catch (error) {
        console.log(`  ❌ Error: ${(error as Error).message}`);
      }
    }
    
    // Try to find a valid patient ID from lab results
    console.log('\n🔍 Finding valid patient IDs from lab results...');
    
    const labResults = await elasticsearchService.search({
      index: 'lab-results',
      size: 5,
      query: { 
        bool: {
          must: [
            { exists: { field: 'patient_id' } },
            { range: { patient_id: { gte: '1' } } }
          ]
        }
      }
    });
    
    if (labResults.hits.hits.length > 0) {
      const validPatientIds = [...new Set(labResults.hits.hits.map((hit: any) => hit._source.patient_id))];
      console.log(`  Found valid patient IDs: ${validPatientIds.slice(0, 5).join(', ')}`);
      
      // Test cross-index search with a valid patient ID
      const testPatientId = validPatientIds[0];
      console.log(`\n🔗 Testing cross-index search for patient: ${testPatientId}`);
      
      for (const index of indices) {
        try {
          const patientData = await elasticsearchService.search({
            index,
            query: {
              term: { patient_id: testPatientId }
            },
            size: 1
          });
          
          const count = patientData.hits.total.value || patientData.hits.total;
          console.log(`    ${index}: ${count} records`);
        } catch (error) {
          console.log(`    ${index}: Error - ${(error as Error).message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkMimicData().catch(console.error);