import elasticsearchService from './src/services/elasticsearch';

async function clearIndices() {
  console.log('🗑️  Clearing Elasticsearch indices...');
  
  const indices = ['patients', 'clinical-notes', 'lab-results', 'medications'];
  
  for (const index of indices) {
    try {
      console.log(`Clearing ${index}...`);
      
      // Delete all documents in the index
      const deleteResult = await elasticsearchService.search({
        index,
        query: { match_all: {} },
        _source: false,
        size: 10000
      });
      
      if (deleteResult.hits.hits.length > 0) {
        const deleteOps = [];
        for (const hit of deleteResult.hits.hits) {
          deleteOps.push({ delete: { _index: index, _id: hit._id } });
        }
        
        await elasticsearchService.client.bulk({
          body: deleteOps,
          refresh: true
        });
        
        console.log(`✅ Cleared ${deleteResult.hits.hits.length} documents from ${index}`);
      } else {
        console.log(`📭 No documents to clear in ${index}`);
      }
    } catch (error) {
      console.log(`❌ Error clearing ${index}: ${(error as Error).message}`);
    }
  }
  
  console.log('🎯 All indices cleared!');
}

clearIndices().catch(console.error);