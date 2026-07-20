const fs = require('fs');

const groupB = [
  { id: 'ahmad', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/ahmed.json' },
  { id: 'darimi', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/darimi.json' },
  { id: 'riyad', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/riyad_assalihin.json' },
  { id: 'aladab_almufrad', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/aladab_almufrad.json' },
  { id: 'bulugh_almaram', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/bulugh_almaram.json' },
  { id: 'mishkat_almasabih', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/mishkat_almasabih.json' },
  { id: 'shamail_muhammadiyah', url: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/shamail_muhammadiyah.json' }
];

async function run() {
  const log = [];
  for (const item of groupB) {
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      log.push(`[Group B: ${item.id}] Status: ${res.status}`);
    } catch(e) {
      log.push(`[Group B: ${item.id}] ERROR: ${e.message}`);
    }
  }
  fs.writeFileSync('group_b_out.txt', log.join('\n'));
  console.log('DONE GROUP B');
}

run();
