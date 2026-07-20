const fs = require('fs');

function verifyLocalMuslim() {
  if (!fs.existsSync('ara-muslim.json') || !fs.existsSync('urd-muslim.json')) {
    console.log('Local files missing');
    return;
  }

  const araData = JSON.parse(fs.readFileSync('ara-muslim.json', 'utf8'));
  const urdData = JSON.parse(fs.readFileSync('urd-muslim.json', 'utf8'));

  const urdHadiths = urdData.hadiths || [];
  const araHadiths = araData.hadiths || [];

  const araMap = new Map();
  araHadiths.forEach(h => {
    if (h && h.hadithnumber !== undefined) araMap.set(String(h.hadithnumber), h);
  });

  const currentBookHadiths = [];
  const processedNumbers = new Set();

  urdHadiths.forEach(urdH => {
    const numStr = String(urdH.hadithnumber);
    processedNumbers.add(numStr);

    const araH = araMap.get(numStr);

    let refStr = '';
    if (urdH.hadithnumber === 0 || (urdH.reference && urdH.reference.book === 0)) {
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

  console.log('=== LOCAL SAHIH MUSLIM MERGE VERIFICATION ===');
  console.log(`Total Merged: ${currentBookHadiths.length} | Valid Renderable Cards: ${validHadiths.length}`);

  console.log('\n--- First 5 Renderable Hadith Cards in Sahih Muslim ---');
  validHadiths.slice(0, 5).forEach((h, idx) => {
    console.log(`\nCard #${idx + 1} [HadithNumber ${h.number}]:`);
    console.log(`  Reference: "${h.reference}"`);
    console.log(`  Arabic Text Length: ${h.text_ar.length}`);
    console.log(`  Urdu Text Length: ${h.text_ur.length}`);
    console.log(`  Urdu Snippet: "${h.text_ur.substring(0, 80)}..."`);
  });
}

verifyLocalMuslim();
