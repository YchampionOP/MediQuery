import elasticsearchService from './src/services/elasticsearch';

async function directSearch() {
  console.log('🔍 Testing direct Elasticsearch search...');
  
  try {
    // Test direct search on patients index
    const result = await elasticsearchService.search({
      index: 'patients',
      query: {
        match: {
          'searchable_text': 'diabetes'
        }
      }
    });
    
    console.log('✅ Direct search results:', result.hits.total.value);
    
    if (result.hits.total.value > 0) {
      console.log('📋 First result:');
      console.log('  ID:', result.hits.hits[0]._id);
      console.log('  Score:', result.hits.hits[0]._score);
      console.log('  Source:', JSON.stringify(result.hits.hits[0]._source, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Search error:', (error as Error).message);
  }
}

directSearch().catch(console.error);