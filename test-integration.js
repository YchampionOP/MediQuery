// Frontend and Backend Integration Test
// Run this script to verify all functionality

const testEndpoints = async () => {
  const baseUrls = {
    frontend: 'http://localhost:3002',
    backend: 'http://localhost:3010'
  };

  console.log('🧪 Testing MediQuery Application...\n');

  // Test 1: Frontend Health
  try {
    const frontendResponse = await fetch(baseUrls.frontend);
    console.log(`✅ Frontend Status: ${frontendResponse.status}`);
  } catch (error) {
    console.log(`❌ Frontend Error: ${error.message}`);
  }

  // Test 2: Backend Health
  try {
    const healthResponse = await fetch(`${baseUrls.backend}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ Backend Status: ${healthData.status}`);
  } catch (error) {
    console.log(`❌ Backend Health Error: ${error.message}`);
  }

  // Test 3: Search API
  try {
    const searchResponse = await fetch(`${baseUrls.backend}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test search', role: 'clinician' })
    });
    const searchData = await searchResponse.json();
    console.log(`✅ Search API: ${searchData.data.totalResults} results found`);
  } catch (error) {
    console.log(`❌ Search API Error: ${error.message}`);
  }

  // Test 4: Stats Endpoint
  try {
    const statsResponse = await fetch(`${baseUrls.backend}/api/stats`);
    const statsData = await statsResponse.json();
    console.log(`✅ Stats API: ${statsData.totalDocuments} total documents`);
  } catch (error) {
    console.log(`❌ Stats API Error: ${error.message}`);
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Frontend: http://localhost:3002');
  console.log('- Backend API: http://localhost:3010');
  console.log('- Search Demo: http://localhost:3002/search');
};

// If running in Node.js
if (typeof require !== 'undefined') {
  const fetch = require('node-fetch');
  testEndpoints().catch(console.error);
}