const fs = require('fs');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  const result = {};
  const books = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];
  
  for (const b of books) {
    const araRes = await get(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${b}.min.json`);
    const urdRes = await get(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${b}.min.json`);
    const engRes = await get(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${b}.min.json`);

    const araData = araRes.status === 200 ? JSON.parse(araRes.body) : null;
    const urdData = urdRes.status === 200 ? JSON.parse(urdRes.body) : null;
    const engData = engRes.status === 200 ? JSON.parse(engRes.body) : null;

    result[b] = {
      araStatus: araRes.status,
      araLength: araData ? araData.hadiths?.length : 0,
      urdStatus: urdRes.status,
      urdLength: urdData ? urdData.hadiths?.length : 0,
      engStatus: engRes.status,
      engLength: engData ? engData.hadiths?.length : 0
    };

    if (b === 'muslim') {
      result.muslim_sample = {
        ara_first5: araData ? araData.hadiths.slice(0, 5) : [],
        urd_first5: urdData ? urdData.hadiths.slice(0, 5) : [],
        eng_first5: engData ? engData.hadiths.slice(0, 5) : []
      };
    }
  }

  fs.writeFileSync('test_output.json', JSON.stringify(result, null, 2));
  console.log('DONE writing test_output.json');
}

run();
