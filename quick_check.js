const fs = require('fs');

async function testBook(book) {
  const [ara, urd, eng] = await Promise.all([
    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}.min.json`).then(r=>r.json()),
    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/urd-${book}.min.json`).then(r=>r.ok ? r.json() : null),
    fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${book}.min.json`).then(r=>r.ok ? r.json() : null)
  ]);

  let res = `=== ${book.toUpperCase()} ===\n`;
  res += `Ara count: ${ara.hadiths.length}, Urd count: ${urd ? urd.hadiths.length : 'N/A'}, Eng count: ${eng ? eng.hadiths.length : 'N/A'}\n`;
  res += `Ara first 3 hadithnumbers: ${ara.hadiths.slice(0,3).map(h=>h.hadithnumber).join(',')}\n`;
  if (urd) {
    res += `Urd first 3 hadithnumbers: ${urd.hadiths.slice(0,3).map(h=>h.hadithnumber).join(',')}\n`;
  }
  if (eng) {
    res += `Eng first 3 hadithnumbers: ${eng.hadiths.slice(0,3).map(h=>h.hadithnumber).join(',')}\n`;
  }

  if (urd) {
    const urdMap = new Map(urd.hadiths.map(h => [String(h.hadithnumber), h]));
    const araMap = new Map(ara.hadiths.map(h => [String(h.hadithnumber), h]));

    const araNoUrd = ara.hadiths.filter(h => !urdMap.has(String(h.hadithnumber)));
    const urdNoAra = urd.hadiths.filter(h => !araMap.has(String(h.hadithnumber)));

    res += `Ara missing in Urd: ${araNoUrd.length}\n`;
    res += `Urd missing in Ara: ${urdNoAra.length}\n`;
    if (araNoUrd.length > 0) {
      res += `Ara missing in Urd first 10 nums: ${araNoUrd.slice(0,10).map(h=>h.hadithnumber).join(',')}\n`;
    }
    if (urdNoAra.length > 0) {
      res += `Urd missing in Ara first 10 nums: ${urdNoAra.slice(0,10).map(h=>h.hadithnumber).join(',')}\n`;
    }
  }

  return res;
}

async function run() {
  const books = ['muslim', 'bukhari', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];
  const results = await Promise.all(books.map(testBook));
  fs.writeFileSync('quick_out.txt', results.join('\n\n'));
  console.log('DONE_QUICK');
}

run();
