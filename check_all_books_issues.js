const fs = require('fs');

async function checkAllBooks() {
  const booksA = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';

  console.log('=== CHECKING GROUP A BOOKS ===');
  for (const b of booksA) {
    try {
      const ara = await (await fetch(`${base}ara-${b}.min.json`)).json();
      const urd = await (await fetch(`${base}urd-${b}.min.json`)).json();
      const eng = await (await fetch(`${base}eng-${b}.min.json`)).json();

      const araHadiths = ara.hadiths || [];
      const urdHadiths = urd.hadiths || [];
      const engHadiths = eng.hadiths || [];

      // Check empty texts
      const emptyAra = araHadiths.filter(h => !h.text || h.text.trim() === '').length;
      const emptyUrd = urdHadiths.filter(h => !h.text || h.text.trim() === '').length;
      const emptyEng = engHadiths.filter(h => !h.text || h.text.trim() === '').length;

      // Check numbers
      const araNums = new Set(araHadiths.map(h => String(h.hadithnumber)));
      const urdNums = new Set(urdHadiths.map(h => String(h.hadithnumber)));
      
      const inUrdNotInAra = urdHadiths.filter(h => !araNums.has(String(h.hadithnumber)));
      const inAraNotInUrd = araHadiths.filter(h => !urdNums.has(String(h.hadithnumber)));

      console.log(`\nBook: ${b}`);
      console.log(`  Lengths -> Ara: ${araHadiths.length}, Urd: ${urdHadiths.length}, Eng: ${engHadiths.length}`);
      console.log(`  Empty Texts -> Ara: ${emptyAra}, Urd: ${emptyUrd}, Eng: ${emptyEng}`);
      console.log(`  Mismatched numbers -> In Urd but not Ara: ${inUrdNotInAra.length}, In Ara but not Urd: ${inAraNotInUrd.length}`);
      if (inUrdNotInAra.length > 0) {
        console.log(`  Sample in Urd not Ara:`, inUrdNotInAra.slice(0, 3).map(h => ({ num: h.hadithnumber, ref: h.reference, text: (h.text||'').substring(0, 30) })));
      }
      if (emptyAra > 0) {
        const emptyAraSample = araHadiths.filter(h => !h.text || h.text.trim() === '').slice(0, 3);
        console.log(`  Sample empty Ara:`, emptyAraSample.map(h => ({ num: h.hadithnumber, ref: h.reference })));
      }
    } catch (err) {
      console.error(`Error checking book ${b}:`, err.message);
    }
  }
}

checkAllBooks();
