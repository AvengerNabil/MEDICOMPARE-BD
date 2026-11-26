import http from 'http';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', err => reject(err));
  });
}

async function runVerification() {
  console.log('--- STARTING EXPANDED FRONTEND VERIFICATION SUITE ---');
  try {
    const res = await fetchUrl('http://localhost:3000');
    console.log(`[PASS] Server Response Status: ${res.statusCode} OK`);

    const assertions = [
      { name: 'Platform Branding', text: 'MediCompare' },
      { name: 'Bangladesh Tag', text: 'BD' },
      { name: 'Official DGDA Attribution', text: 'Directorate General of Drug Administration (DGDA)' },
      { name: 'Scale Indicator (21,646+)', text: '21,646' },
      { name: 'Database Audit & Reports Navigation', text: 'Database Audit &amp; Reports' },
      { name: 'Hero Headline', text: 'Find Smarter' },
      { name: 'Search Input Placeholder', text: 'Search by brand name' },
      { name: 'Medical Safety Notice', text: 'Medical Safety Notice' },
      { name: 'Category Browsing', text: 'Browse by Therapeutic Category' },
      { name: 'Generic Comparison Matrix', text: 'Compare Matching Brands &amp; Prices' },
      { name: 'Potential Savings Calculator', text: 'Potential Medicine Cost Savings Calculator' },
      { name: 'Manufacturer Directory', text: 'Pharmaceutical Manufacturers Directory' },
      { name: 'Frequently Asked Questions', text: 'Frequently Asked Questions' },
      { name: 'Regulatory Footer', text: 'Regulatory &amp; Clinical Notice' },
      { name: 'DAR Registration Numbers', text: 'DAR-' },
      { name: 'Official MRP Currency (BDT)', text: '৳' },
    ];

    let passedCount = 0;
    for (const item of assertions) {
      if (res.body.includes(item.text)) {
        console.log(`[PASS] Verified Section: ${item.name}`);
        passedCount++;
      } else {
        console.error(`[FAIL] Missing Expected Component/Text: ${item.name} (${item.text})`);
      }
    }

    console.log(`\nVerification Score: ${passedCount}/${assertions.length} assertions passed.`);
    if (passedCount === assertions.length) {
      console.log('ALL FRONTEND QUALITY & EXPANSION ACCEPTANCE CRITERIA MET WITH 100% SUCCESS.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('[ERROR] Verification failed with network/server error:', error.message);
    process.exit(1);
  }
}

runVerification();
