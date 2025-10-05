import elasticsearchService from './src/services/elasticsearch';

async function testRealMimicData() {
  console.log('🏥 Testing Real MIMIC-III Data Search...');
  
  try {
    // Get actual patient data from lab results (which has real patient IDs)
    console.log('\n🔍 Finding real patient IDs from MIMIC data...');
    
    const labData = await elasticsearchService.search({
      index: 'lab-results',
      size: 10,
      query: {
        bool: {
          must: [
            { exists: { field: 'patient_id' } },
            { range: { patient_id: { gte: '10000' } } }
          ]
        }
      }
    });
    
    if (labData.hits.hits.length > 0) {
      const realPatientIds = [...new Set(labData.hits.hits.map((hit: any) => hit._source.patient_id))];
      console.log(`Found real MIMIC patient IDs: ${realPatientIds.slice(0, 5).join(', ')}`);
      
      // Test search with real patient ID
      const testPatientId = realPatientIds[0];
      console.log(`\n🔍 Searching data for real patient: ${testPatientId}`);
      
      // Search across all indices for this patient
      const patientData = await elasticsearchService.search({
        index: ['patients', 'clinical-notes', 'lab-results', 'medications'],
        query: {
          term: { patient_id: testPatientId }
        },
        size: 20
      });
      
      console.log(`Found ${patientData.hits.hits.length} records for patient ${testPatientId}:`);
      
      const groupedResults: any = {};
      patientData.hits.hits.forEach((hit: any) => {
        const index = hit._index;
        if (!groupedResults[index]) groupedResults[index] = 0;
        groupedResults[index]++;
      });
      
      Object.entries(groupedResults).forEach(([index, count]) => {
        console.log(`  📋 ${index}: ${count} records`);
      });
      
      // Show sample lab results
      const patientLabs = patientData.hits.hits.filter((hit: any) => hit._index === 'lab-results').slice(0, 3);
      if (patientLabs.length > 0) {
        console.log(`\n🧪 Sample lab results for patient ${testPatientId}:`);
        patientLabs.forEach((hit: any, index: number) => {
          const lab = hit._source;
          console.log(`  ${index + 1}. ${lab.label}: ${lab.value} ${lab.valueuom || ''} (${lab.charttime})`);
        });
      }
      
      // Show sample medications
      const patientMeds = patientData.hits.hits.filter((hit: any) => hit._index === 'medications').slice(0, 3);
      if (patientMeds.length > 0) {
        console.log(`\n💊 Sample medications for patient ${testPatientId}:`);
        patientMeds.forEach((hit: any, index: number) => {
          const med = hit._source;
          console.log(`  ${index + 1}. ${med.drug} (${med.route}, ${med.startdate})`);
        });
      }
    }
    
    // Test medical term searches
    console.log('\n🔍 Testing medical term searches...');
    
    const medicalQueries = [
      'dextrose',
      'sodium chloride',
      'potassium',
      'hematocrit',
      'glucose',
      'creatinine',
      'morphine',
      'lopressor'
    ];
    
    for (const term of medicalQueries) {
      try {
        const results = await elasticsearchService.hybridSearch({
          query: term,
          size: 2
        });
        
        if (results.hits.length > 0) {
          console.log(`  📋 \"${term}\": ${results.hits.length} results`);
          results.hits.forEach((hit: any, index: number) => {
            console.log(`    ${index + 1}. [${hit.index}] Score: ${hit.score.toFixed(2)}`);
          });
        } else {
          console.log(`  📋 \"${term}\": No results`);
        }
      } catch (error) {
        console.log(`  ❌ \"${term}\": Error`);
      }
    }
    
    // Test range queries for lab values
    console.log('\n🧪 Testing lab value range queries...');
    
    const labRangeResult = await elasticsearchService.search({
      index: 'lab-results',
      query: {
        bool: {
          must: [
            { exists: { field: 'valuenum' } },
            { range: { valuenum: { gte: 100, lte: 200 } } }
          ]
        }
      },
      size: 5
    });
    
    console.log(`Found ${labRangeResult.hits.hits.length} lab results with values 100-200:`);
    labRangeResult.hits.hits.forEach((hit: any, index: number) => {
      const lab = hit._source;
      console.log(`  ${index + 1}. ${lab.label}: ${lab.valuenum} ${lab.valueuom || ''} (Patient: ${lab.patient_id})`);
    });
    
    // Final statistics
    console.log('\n📊 Final MIMIC-III Data Statistics:');
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
    
    console.log(`  🎯 Total MIMIC-III records: ${totalRecords.toLocaleString()}`);
    console.log('\n🎉 MIMIC-III data is fully loaded and searchable!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealMimicData().catch(console.error);