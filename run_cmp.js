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

async function run() {
  const ara = await get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim.min.json');
  const urd = await get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-muslim.min.json');
  const eng = await get('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-muslim.min.json');

  const out = [];
  out.push(`Ara length: ${ara.hadiths.length}`);
  out.push(`Urd length: ${urd.hadiths.length}`);
  out.push(`Eng length: ${eng.hadiths.length}`);

  const urdNums = new Set(urd.hadiths.map(h => String(h.hadithnumber)));
  const araNums = new Set(ara.hadiths.map(h => String(h.hadithnumber)));
  const engNums = new Set(eng.hadiths.map(h => String(h.hadithnumber)));

  let missingInUrd = ara.hadiths.filter(h => !urdNums.has(String(h.hadithnumber)));
  let missingInAra = urd.hadiths.filter(h => !araNums.has(String(h.hadithnumber)));

  out.push(`Arabic Hadiths missing in Urdu count: ${missingInUrd.length}`);
  out.push(`Urdu Hadiths missing in Arabic count: ${missingInAra.length}`);

  out.push('Sample missing in Urdu: ' + JSON.stringify(missingInUrd.slice(0, 10).map(h => ({ num: h.hadithnumber, ref: h.reference })), null, 2));

  // Let's also check how hadiths are matched by reference or book/hadith numbers in reference!
  out.push('\nFirst 5 Arabic: ' + JSON.stringify(ara.hadiths.slice(0, 5), null, 2));
  out.push('\nFirst 5 Urdu: ' + JSON.stringify(urd.hadiths.slice(0, 5), null, 2));
  out.push('\nFirst 5 English: ' + JSON.stringify(eng.hadiths.slice(0, 5), null, 2));

  fs.writeFileSync('cmp_out.txt', out.join('\n'));
}

run();
