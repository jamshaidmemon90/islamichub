const fs = require('fs');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function analyzeAll() {
  const log = [];
  const books = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];

  for (const book of books) {
    log.push(`\n=================== ${book.toUpperCase()} ===================`);
    try {
      const ara = await get(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}.min.json`);
      const urd = await get(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${book}.min.json`);
      const eng = await get(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${book}.min.json`);

      log.push(`Arabic count: ${ara.hadiths ? ara.hadiths.length : 'N/A'}`);
      log.push(`Urdu count:   ${urd.hadiths ? urd.hadiths.length : 'N/A'}`);
      log.push(`English count:${eng.hadiths ? eng.hadiths.length : 'N/A'}`);

      if (ara.hadiths && urd.hadiths) {
        const urdMap = new Map(urd.hadiths.map(h => [String(h.hadithnumber), h]));
        const araMap = new Map(ara.hadiths.map(h => [String(h.hadithnumber), h]));
        const engMap = new Map((eng.hadiths || []).map(h => [String(h.hadithnumber), h]));

        let araNotInUrd = 0;
        ara.hadiths.forEach(h => {
          if (!urdMap.has(String(h.hadithnumber))) araNotInUrd++;
        });

        log.push(`Arabic hadiths with NO matching Urdu hadithnumber: ${araNotInUrd}`);

        // Check first 10 hadiths of Muslim or Bukhari to inspect hadithnumber & reference structure
        log.push('First 3 Arabic hadiths: ' + JSON.stringify(ara.hadiths.slice(0, 3).map(h => ({ num: h.hadithnumber, ref: h.reference })), null, 2));
        log.push('First 3 Urdu hadiths:   ' + JSON.stringify(urd.hadiths.slice(0, 3).map(h => ({ num: h.hadithnumber, ref: h.reference })), null, 2));
        if (eng.hadiths) {
          log.push('First 3 English hadiths:' + JSON.stringify(eng.hadiths.slice(0, 3).map(h => ({ num: h.hadithnumber, ref: h.reference })), null, 2));
        }
      }
    } catch(e) {
      log.push(`ERROR loading ${book}: ${e.message}`);
    }
  }

  fs.writeFileSync('output_analysis.txt', log.join('\n'));
  console.log('Analysis written to output_analysis.txt');
}

analyzeAll();
