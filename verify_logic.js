const https = require('https');
const agent = new https.Agent({ family: 4, keepAlive: true });

function getJson(url) {
  return new Promise((resolve) => {
    https.get(url, { agent }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function verifyAllCollections() {
  const booksA = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';

  console.log('=== VERIFYING GROUP A BOOKS ===');
  for (const id of booksA) {
    const araData = await getJson(`${base}ara-${id}.min.json`);
    const urdData = await getJson(`${base}urd-${id}.min.json`);

    const urdHadiths = urdData ? (urdData.hadiths || []) : [];
    const araHadiths = araData ? (araData.hadiths || []) : [];

    const araMap = new Map();
    araHadiths.forEach(h => {
      if (h && h.hadithnumber !== undefined) araMap.set(String(h.hadithnumber), h);
    });

    let currentBookHadiths = [];
    const processedNumbers = new Set();

    urdHadiths.forEach(urdH => {
      const numStr = String(urdH.hadithnumber);
      processedNumbers.add(numStr);

      const araH = araMap.get(numStr);

      let refStr = '';
      if (id === 'muslim' && (urdH.hadithnumber === 0 || (urdH.reference && urdH.reference.book === 0))) {
        refStr = `مقدمۃ صحیح مسلم (Introduction) - Hadith ${urdH.hadithnumber}`;
      } else if (urdH.reference && urdH.reference.book !== undefined) {
        refStr = `Book ${urdH.reference.book}, Hadith ${urdH.reference.hadith || urdH.hadithnumber}`;
      } else {
        refStr = `Hadith ${urdH.hadithnumber}`;
      }

      currentBookHadiths.push({
        number: urdH.hadithnumber,
        reference: refStr,
        text_ar: (araH && araH.text) ? araH.text : '',
        text_ur: urdH.text || ''
      });
    });

    araHadiths.forEach(araH => {
      const numStr = String(araH.hadithnumber);
      if (!processedNumbers.has(numStr)) {
        processedNumbers.add(numStr);
        let refStr = (araH.reference && araH.reference.book !== undefined) 
          ? `Book ${araH.reference.book}, Hadith ${araH.reference.hadith || araH.hadithnumber}` 
          : `Hadith ${araH.hadithnumber}`;

        currentBookHadiths.push({
          number: araH.hadithnumber,
          reference: refStr,
          text_ar: araH.text || '',
          text_ur: ''
        });
      }
    });

    const validHadiths = currentBookHadiths.filter(h => (h.text_ar && h.text_ar.trim() !== '') || (h.text_ur && h.text_ur.trim() !== ''));
    console.log(`[${id.toUpperCase()}] Total merged: ${currentBookHadiths.length} | Valid renderable cards: ${validHadiths.length}`);
    
    if (id === 'muslim') {
      console.log('--- Sahih Muslim Sample First 4 Cards ---');
      validHadiths.slice(0, 4).forEach((h, idx) => {
        console.log(`Card ${idx + 1}: Ref="${h.reference}" | ArLen=${h.text_ar.length} | UrLen=${h.text_ur.length}`);
        console.log(`  Urdu Text snippet: "${h.text_ur.substring(0, 60)}..."`);
      });
    }
  }
}

verifyAllCollections();
