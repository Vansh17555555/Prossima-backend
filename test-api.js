const axios = require('axios');

async function testApi() {
  const baseUrl = 'http://localhost:3000/api/tenders';
  
  try {
    console.log('--- Testing API Endpoints ---');

    // 1. Health check
    const health = await axios.get('http://localhost:3000/health');
    console.log('Health check:', health.data.status);

    // 2. POST (Upsert) a test tender
    const testTender = {
      tender_no: 'TEST-12345',
      department: 'TEST-DEPT',
      title: 'Electronic Procurement System test',
      status: 'Published',
      work_area: 'Goods & Service',
      due_at: new Date(Date.now() + 86400000).toISOString(),
      pdf_link: 'http://example.com/test.pdf'
    };
    
    console.log('Upserting test tender...');
    const postRes = await axios.post(baseUrl, testTender);
    console.log('Upsert status:', postRes.status);

    // 3. GET all tenders (should hit DB then cache)
    console.log('Fetching tenders (Cache Miss expected)...');
    const getRes1 = await axios.get(baseUrl);
    console.log('Fetched:', getRes1.data.count, 'tenders');

    // 4. GET again (should hit Cache)
    console.log('Fetching tenders again (Cache Hit expected)...');
    const getRes2 = await axios.get(baseUrl);
    console.log('Fetched:', getRes2.data.count, 'tenders');

    // 5. GET by tender_no
    console.log('Fetching specific tender...');
    const getOne = await axios.get(`${baseUrl}/TEST-12345`);
    console.log('Found tender:', getOne.data.tender_no);

    console.log('\n--- API Verification Successful ---');
    process.exit(0);
  } catch (err) {
    console.error('API Test failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

// Start the server first (handled in terminal externally usually, but we'll assume it's running)
testApi();
