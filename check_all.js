const fs = require('fs');

async function check(b) {
  const lines = [];
  try {
    const [ara, urdRes, engRes] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-' + b + '.min.json').then(r=>r.json()),
      fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-' + b + '.min.json'),
      fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-' + b + '.min.json')
    ]);
    const urd = urdRes.ok ? await urdRes.json() : null;
    const eng = engRes.ok ? await engRes.json() : null;
    
    lines.push(`=== BOOK: ${b} ===`);
    lines.push(`  Arabic count: ${ara.hadiths.length}, first 3 nums: ${ara.hadiths.slice(0,3).map(h=>h.hadithnumber).join(',')}`);
    if (urd) {
      lines.push(`  Urdu count:   ${urd.hadiths.length}, first 3 nums: ${urd.hadiths.slice(0,3).map(h=>h.hadithnumber).join(',')}`);
    } else {
      lines.push(`  Urdu: NOT AVAILABLE`);
    }
    if (eng) {
      lines.push(`  English count:${eng.hadiths.length}, first 3 nums: ${eng.hadiths.slice(0,3).map(h=>h.hadithnumber).join(',')}`);
    } else {
      lines.push(`  English: NOT AVAILABLE`);
    }
    
    if (urd) {
      const urdMap = new Map(urd.hadiths.map(h => [String(h.hadithnumber), h]));
      const araMap = new Map(ara.hadiths.map(h => [String(h.hadithnumber), h]));
      
      let araNoUrd = ara.hadiths.filter(h => !urdMap.has(String(h.hadithnumber)));
      let urdNoAra = urd.hadiths.filter(h => !araMap.has(String(h.hadithnumber)));

      lines.push(`  Arabic hadiths with no Urdu match: ${araNoUrd.length}`);
      lines.push(`  Urdu hadiths with no Arabic match: ${urdNoAra.length}`);

      if (araNoUrd.length > 0) {
        lines.push(`  Sample Arabic missing in Urdu hadithnumbers: ${araNoUrd.slice(0,10).map(h=>h.hadithnumber).join(',')}`);
      }
      if (urdNoAra.length > 0) {
        lines.push(`  Sample Urdu missing in Arabic hadithnumbers: ${urdNoAra.slice(0,10).map(h=>h.hadithnumber).join(',')}`);
      }
    }
  } catch(e) {
    lines.push(`=== BOOK: ${b} ERROR: ${e.message}`);
  }
  return lines.join('\n');
}

async function run() {
  const books = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik', 'nawawi', 'qudsi'];
  const results = await Promise.all(books.map(check));
  fs.writeFileSync('check_all_out.txt', results.join('\n\n'));
  console.log('DONE writing check_all_out.txt');
}

run();
