const fs = require('fs');

async function testOne(book) {
  try {
    const araRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}.min.json`);
    const ara = await araRes.json();
    
    let urd = null;
    const urdRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${book}.min.json`);
    if (urdRes.ok) urd = await urdRes.json();

    let eng = null;
    const engRes = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${book}.min.json`);
    if (engRes.ok) eng = await engRes.json();

    let araCount = ara.hadiths ? ara.hadiths.length : 0;
    let urdCount = urd && urd.hadiths ? urd.hadiths.length : 0;
    let engCount = eng && eng.hadiths ? eng.hadiths.length : 0;

    let resultStr = `[${book.toUpperCase()}] Ara: ${araCount}, Urd: ${urdCount}, Eng: ${engCount}\n`;
    
    if (ara.hadiths && ara.hadiths.length > 0) {
      resultStr += `  Ara first 3 hadithnumbers: ${ara.hadiths.slice(0,3).map(h=>h.hadithnumber).join(', ')}\n`;
    }
    if (urd && urd.hadiths && urd.hadiths.length > 0) {
      resultStr += `  Urd first 3 hadithnumbers: ${urd.hadiths.slice(0,3).map(h=>h.hadithnumber).join(', ')}\n`;
    }
    if (eng && eng.hadiths && eng.hadiths.length > 0) {
      resultStr += `  Eng first 3 hadithnumbers: ${eng.hadiths.slice(0,3).map(h=>h.hadithnumber).join(', ')}\n`;
    }

    if (urd && urd.hadiths) {
      const urdMap = new Map(urd.hadiths.map(h => [String(h.hadithnumber), h]));
      const araMap = new Map(ara.hadiths.map(h => [String(h.hadithnumber), h]));

      let araNoUrd = ara.hadiths.filter(h => !urdMap.has(String(h.hadithnumber)));
      let urdNoAra = urd.hadiths.filter(h => !araMap.has(String(h.hadithnumber)));

      resultStr += `  Arabic hadiths missing in Urdu: ${araNoUrd.length}\n`;
      resultStr += `  Urdu hadiths missing in Arabic: ${urdNoAra.length}\n`;
      if (araNoUrd.length > 0) {
        resultStr += `  Sample Arabic missing in Urdu (hadithnumbers): ${araNoUrd.slice(0,5).map(h=>h.hadithnumber).join(', ')}\n`;
      }
    }

    return resultStr;
  } catch(e) {
    return `[${book.toUpperCase()}] ERROR: ${e.message}\n`;
  }
}

async function run() {
  const books = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik', 'nawawi', 'qudsi'];
  const res = [];
  for (const b of books) {
    console.log('Testing', b, '...');
    res.push(await testOne(b));
  }
  fs.writeFileSync('books_summary.txt', res.join('\n'));
  console.log('FINISH_TEST_SUMMARY');
}

run();
