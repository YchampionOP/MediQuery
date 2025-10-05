import { hybridSearchEngine } from './src/services/hybridSearch';

async function testHybridSearch() {
  console.log('🔍 Testing hybrid search...');
  
  try {
    const result = await hybridSearchEngine.search({
      query: 'diabetes',
      userRole: 'clinician'
    });
    
    console.log('✅ Hybrid search results:', result.totalResults);
    console.log('📋 Results:', JSON.stringify(result.results, null, 2));
    
  } catch (error) {
    console.error('❌ Hybrid search error:', (error as Error).message);
  }
}

testHybridSearch().catch(console.error);