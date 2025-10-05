import { MimicDataProcessor } from './src/scripts/mimic-processor';
import elasticsearchService from './src/services/elasticsearch';

async function uploadMimicData() {
  console.log('🏥 MIMIC-III Data Upload to Elasticsearch');
  console.log('=' .repeat(60));
  
  try {
    // Test connection first
    console.log('🔍 Testing Elasticsearch connection...');
    await elasticsearchService.testConnection();
    console.log('✅ Connection successful');
    
    // Initialize MIMIC processor
    const mimicPath = 'c:\\\\Users\\\\gamin\\\\Desktop\\\\MediQuery\\\\mimic-iii-clinical-database-demo-1.4';
    const processor = new MimicDataProcessor(mimicPath);
    
    console.log('\n📊 Starting MIMIC-III data processing...');
    console.log(`Data path: ${mimicPath}`);
    
    // Process all MIMIC data
    await processor.processAllData();
    
    console.log('\n🎉 MIMIC-III upload completed!');
    
    // Get final counts
    console.log('\n📈 Final Index Summary:');
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
    
    // Quick search test
    console.log('\n🔍 Testing search functionality...');
    
    const testResults = await elasticsearchService.hybridSearch({
      query: 'patient',
      size: 3
    });
    
    console.log(`✅ Search test: Found ${testResults.hits.length} results`);
    if (testResults.hits.length > 0) {
      testResults.hits.forEach((hit: any, index: number) => {
        console.log(`  ${index + 1}. [${hit.index}] Score: ${hit.score.toFixed(2)}`);
      });
    }
    
    console.log('\n🏆 MIMIC-III data is ready for use!');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadMimicData().catch(console.error);