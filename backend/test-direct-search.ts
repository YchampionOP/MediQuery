import { elasticsearchService } from './src/services/elasticsearch';

async function testDirectSearch() {
  try {
    console.log('🔍 Testing direct search with elasticsearchService...');
    
    // Test the search method directly
    const result = await elasticsearchService.search({
      index: ['patients'],
      body: {
        query: {
          match: {
            'searchable_text': 'diabetes'
          }
        },
        size: 5
      }
    });
    
    console.log('🔍 Direct search result:', result.hits.total);
    console.log('🔍 Sample hits:', JSON.stringify(result.hits.hits.slice(0, 2), null, 2));
    
  } catch (error) {
    console.error('Direct search failed:', error);
  }
}

testDirectSearch();