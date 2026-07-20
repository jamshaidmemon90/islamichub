const fs = require('fs');
const https = require('https');
const agent = new https.Agent({ family: 4, keepAlive: true });

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent, timeout: 10000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, error: e.message }); }
      });
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  const log = [];
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';

  log.push('=== GROUP A BOOKS (fawazahmed0 API) ===');
  const groupA = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'nasai', 'ibnmajah', 'malik'];
  for (const b of groupA) {
    const ara = await getJson(`${base}ara-${b}.min.json`);
    const urd = await getJson(`${base}urd-${b}.min.json`);
    const eng = await getJson(`${base}eng-${b}.min.json`);

    const araCount = ara.data ? (ara.data.hadiths || []).length : 'ERR ' + ara.error;
    const urdCount = urd.data ? (urd.data.hadiths || []).length : 'ERR ' + urd.error;
    const engCount = eng.data ? (eng.data.hadiths || []).length : 'ERR ' + eng.error;

    // Check empty texts in Ara/Urd/Eng
    let araEmpty = 0, urdEmpty = 0, engEmpty = 0;
    if (ara.data) araEmpty = ara.data.hadiths.filter(h => !h.text || h.text.trim() === '').length;
    if (urd.data) urdEmpty = urd.data.hadiths.filter(h => !h.text || h.text.trim() === '').length;
    if (eng.data) engEmpty = eng.data.hadiths.filter(h => !h.text || h.text.trim() === '').length;

    log.push(`${b}: Ara=${araCount} (empty ${araEmpty}) | Urd=${urdCount} (empty ${urdEmpty}) | Eng=${engCount} (empty ${engEmpty})`);
  }

  log.push('\n=== GROUP C BOOKS (fawazahmed0 API) ===');
  const groupC = ['nawawi', 'qudsi', 'dehlawi'];
  for (const b of groupC) {
    const ara = await getJson(`${base}ara-${b}.min.json`);
    const eng = await getJson(`${base}eng-${b}.min.json`);
    const urd = await getJson(`${base}urd-${b}.min.json`);

    log.push(`${b}: Ara=${ara.data?.hadiths?.length || ara.error} | Eng=${eng.data?.hadiths?.length || eng.error} | Urd=${urd.data?.hadiths?.length || urd.error}`);
  }

  log.push('\n=== GROUP B BOOKS (AhmedBaset API) ===');
  const groupB = {
    ahmad: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/ahmed.json',
    darimi: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/the_9_books/darimi.json',
    riyad: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/riyad_assalihin.json',
    aladab_almufrad: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/aladab_almufrad.json',
    bulugh_almaram: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/bulugh_almaram.json',
    mishkat_almasabih: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/mishkat_almasabih.json',
    shamail_muhammadiyah: 'https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db/by_book/other_books/shamail_muhammadiyah.json'
  };

  for (const [id, url] of Object.entries(groupB)) {
    const res = await getJson(url);
    if (res.data && res.data.hadiths) {
      log.push(`${id}: Status ${res.status}, Hadiths count = ${res.data.hadiths.length}`);
    } else {
      log.push(`${id}: Status ${res.status}, Error = ${res.error || 'No hadiths field'}`);
    }
  }

  fs.writeFileSync('all_books_status.txt', log.join('\n'));
  console.log('DONE TEST ALL BOOKS TO FILE');
}

run();
