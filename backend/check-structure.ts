import elasticsearchService from './src/services/elasticsearch';

async function checkStructure() {
  console.log('🔍 Checking document structures...');
  
  // Check patients index
  try {
    const patients = await elasticsearchService.search({
      index: 'patients',
      size: 1,
      query: { match_all: {} }
    });
    
    if (patients.hits.hits.length > 0) {
      console.log('📋 Patients document structure:');
      const source = patients.hits.hits[0]._source;
      console.log('  Fields:', Object.keys(source));
      console.log('  Sample data:', JSON.stringify(source, null, 2));
    }
  } catch (error) {
    console.error('❌ Error checking patients:', (error as Error).message);
  }
  
  // Check clinical-notes index
  try {
    const notes = await elasticsearchService.search({
      index: 'clinical-notes',
      size: 1,
      query: { match_all: {} }
    });
    
    if (notes.hits.hits.length > 0) {
      console.log('\n📋 Clinical Notes document structure:');
      const source = notes.hits.hits[0]._source;
      console.log('  Fields:', Object.keys(source));
      console.log('  Sample data:', JSON.stringify(source, null, 2));
    }
  } catch (error) {
    console.error('❌ Error checking clinical notes:', (error as Error).message);
  }
  
  // Check lab-results index
  try {
    const labs = await elasticsearchService.search({
      index: 'lab-results',
      size: 1,
      query: { match_all: {} }
    });
    
    if (labs.hits.hits.length > 0) {
      console.log('\n📋 Lab Results document structure:');
      const source = labs.hits.hits[0]._source;
      console.log('  Fields:', Object.keys(source));
      console.log('  Sample data:', JSON.stringify(source, null, 2));
    }
  } catch (error) {
    console.error('❌ Error checking lab results:', (error as Error).message);
  }
}

checkStructure().catch(console.error);