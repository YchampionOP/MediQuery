import { Client } from '@elastic/elasticsearch';

// Elasticsearch configuration
const ELASTICSEARCH_CONFIG = {
  node: 'https://my-elasticsearch-project-b1c395.es.us-central1.gcp.elastic.cloud:443',
  auth: {
    apiKey: 'Yzlxa3Naa0JYMHEyN2RUZ2ptckg6TzB2dDNfc1ZxbVhlZEw5UFJNVFdiQQ=='
  },
  tls: {
    rejectUnauthorized: true
  }
};

async function testClientSearch() {
  try {
    console.log('🔍 Testing direct client search...');
    
    const client = new Client(ELASTICSEARCH_CONFIG);
    
    // Test ping
    await client.ping();
    console.log('✅ Elasticsearch ping successful');
    
    // Test search
    const result = await client.search({
      index: ['patients'],
      query: {
        match: {
          'searchable_text': 'diabetes'
        }
      },
      size: 5
    });
    
    console.log('🔍 Client search result:', result.hits.total);
    console.log('🔍 Sample hits:', JSON.stringify(result.hits.hits.slice(0, 2), null, 2));
    
  } catch (error) {
    console.error('Client search failed:', error);
  }
}

testClientSearch();