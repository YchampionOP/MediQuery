import { elasticsearchService } from './src/services/elasticsearch';

async function testSearch() {
  try {
    console.log('🔍 Testing Elasticsearch connection...');
    
    // Test connection
    const isConnected = await elasticsearchService.testConnection();
    console.log('Connection status:', isConnected);
    
    // Test health
    const health = await elasticsearchService.getHealth();
    console.log('Health status:', JSON.stringify(health, null, 2));
    
    // Test direct search with the exact query that should work
    console.log('\n🔍 Testing direct search for "diabetes"...');
    const directResult = await elasticsearchService.client.search({
      index: ['patients', 'clinical-notes', 'lab-results', 'medications'],
      query: {
        match: {
          'searchable_text': 'diabetes'
        }
      },
      size: 5
    });
    
    console.log('Direct search results count:', directResult.hits.total.value);
    if (directResult.hits.total.value > 0) {
      console.log('Sample hits:', JSON.stringify(directResult.hits.hits.slice(0, 2), null, 2));
    }
    
    // Test the hybrid search method
    console.log('\n🔍 Testing hybrid search...');
    const hybridResult = await elasticsearchService.hybridSearch({
      query: 'diabetes',
      size: 5
    });
    
    console.log('Hybrid search results:', hybridResult.total);
    if (hybridResult.hits.length > 0) {
      console.log('Sample hits:', JSON.stringify(hybridResult.hits.slice(0, 2), null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSearch();