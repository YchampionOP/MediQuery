import elasticsearchService from './src/services/elasticsearch';

async function testSearch() {
  console.log('Testing search functionality...');
  
  try {
    // Test search for diabetes
    console.log('\n🔍 Searching for \"diabetes\"...');
    const diabetesResults = await elasticsearchService.hybridSearch({
      query: 'diabetes',
      size: 5
    });
    
    console.log(`✅ Found ${diabetesResults.hits.length} results for diabetes`);
    if (diabetesResults.hits.length > 0) {
      diabetesResults.hits.forEach((hit: any, index: number) => {
        console.log(`  ${index + 1}. [${hit.index}] Score: ${hit.score.toFixed(2)}`);
        console.log(`     ${JSON.stringify(hit.source).substring(0, 100)}...`);
      });
    }
    
    // Test search for blood pressure
    console.log('\n🔍 Searching for \"blood pressure\"...');
    const bpResults = await elasticsearchService.hybridSearch({
      query: 'blood pressure',
      size: 3
    });
    
    console.log(`✅ Found ${bpResults.hits.length} results for blood pressure`);
    if (bpResults.hits.length > 0) {
      bpResults.hits.forEach((hit: any, index: number) => {
        console.log(`  ${index + 1}. [${hit.index}] Score: ${hit.score.toFixed(2)}`);
      });
    }
    
    // Test search for medication
    console.log('\n🔍 Searching for \"medication\"...');
    const medResults = await elasticsearchService.hybridSearch({
      query: 'medication',
      size: 3
    });
    
    console.log(`✅ Found ${medResults.hits.length} results for medication`);
    if (medResults.hits.length > 0) {
      medResults.hits.forEach((hit: any, index: number) => {
        console.log(`  ${index + 1}. [${hit.index}] Score: ${hit.score.toFixed(2)}`);
      });
    }
    
    // Get index counts
    console.log('\n📊 Index Summary:');
    const indices = ['patients', 'clinical-notes', 'lab-results', 'medications'];
    
    for (const index of indices) {
      try {
        const result = await elasticsearchService.search({
          index,
          size: 0,
          query: { match_all: {} }
        });
        
        const count = result.hits.total.value || result.hits.total;
        console.log(`  ${index}: ${count} documents`);
      } catch (error) {
        console.log(`  ${index}: Error - ${(error as Error).message}`);
      }
    }
    
    console.log('\n🎉 Search functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Search test failed:', error);
    process.exit(1);
  }
}

testSearch().catch(console.error);