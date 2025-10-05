// Test Elasticsearch connection
import elasticsearchService from './src/services/elasticsearch';

async function testConnection() {
  console.log('Testing Elasticsearch connection...');
  
  try {
    // Test basic connection
    const isConnected = await elasticsearchService.testConnection();
    console.log('✅ Connection test:', isConnected ? 'SUCCESS' : 'FAILED');
    
    // Get cluster health
    const health = await elasticsearchService.getHealth();
    console.log('📊 Cluster Health:');
    console.log('  Status:', health.cluster.status);
    console.log('  Nodes:', health.cluster.number_of_nodes);
    console.log('  Data Nodes:', health.cluster.number_of_data_nodes);
    console.log('  Active Shards:', health.cluster.active_shards);
    
    // Check indices
    const indices = ['patients', 'clinical-notes', 'lab-results', 'medications', 'research-papers'];
    console.log('\n🗂️  Index Status:');
    
    for (const index of indices) {
      try {
        const count = await elasticsearchService.search({
          index,
          size: 0,
          query: { match_all: {} }
        });
        const total = count.hits.total.value || count.hits.total;
        console.log(`  ${index}: ${total} documents`);
      } catch (error) {
        console.log(`  ${index}: Error - ${(error as Error).message}`);
      }
    }
    
    console.log('\n🎉 Elasticsearch is ready for data!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection failed:', (error as Error).message);
    process.exit(1);
  }
}

testConnection().catch(console.error);