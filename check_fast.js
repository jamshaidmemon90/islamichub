const https = require('https');
const agent = new https.Agent({ family: 4 });

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function check() {
  const booksA = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';

  for (const b of booksA) {
    try {
      const ara = await getJson(`${base}ara-${b}.min.json`);
      const urd = await getJson(`${base}urd-${b}.min.json`);
      const eng = await getJson(`${base}eng-${b}.min.json`);

      const araH = ara.hadiths || [];
      const urdH = urd.hadiths || [];
      const engH = eng.hadiths || [];

      const emptyAra = araH.filter(h => !h.text || h.text.trim() === '').length;
      const emptyUrd = urdH.filter(h => !h.text || h.text.trim() === '').length;
      const emptyEng = engH.filter(h => !h.text || h.text.trim() === '').length;

      // Check for mismatch in hadithnumbers between ara and urd
      const araNumMap = new Map();
      araH.forEach(h => araNumMap.set(String(h.hadithnumber), h));

      let urdNoAraText = 0;
      urdH.forEach(h => {
        const match = araNumMap.get(String(h.hadithnumber));
        if (!match || !match.text || match.text.trim() === '') {
          urdNoAraText++;
        }
      });

      console.log(`${b.toUpperCase().padEnd(10)} | Ara: ${araH.length} (empty: ${emptyAra}) | Urd: ${urdH.length} (empty: ${emptyUrd}) | Eng: ${engH.length} (empty: ${emptyEng}) | Urd without Ara text: ${urdNoAraText}`);
    } catch(err) {
      console.log(`Error checking ${b}:`, err.message);
    }
  }
}

check();
