const fs = require('fs');

async function run() {
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';
  const [araM, urdM, engM] = await Promise.all([
    fetch(base + 'ara-muslim.min.json').then(r=>r.json()),
    fetch(base + 'urd-muslim.min.json').then(r=>r.json()),
    fetch(base + 'eng-muslim.min.json').then(r=>r.json())
  ]);

  const log = [];
  log.push(`Ara total: ${araM.hadiths.length}`);
  log.push(`Urd total: ${urdM.hadiths.length}`);
  log.push(`Eng total: ${engM.hadiths.length}`);

  log.push('\n--- URD HADITH INDEX 0 vs 1 ---');
  log.push(`Urd[0] (hadithnumber ${urdM.hadiths[0].hadithnumber}): ${JSON.stringify(urdM.hadiths[0])}`);
  log.push(`Urd[1] (hadithnumber ${urdM.hadiths[1].hadithnumber}): ${JSON.stringify(urdM.hadiths[1])}`);

  log.push('\n--- ARA HADITH INDEX 0 vs 1 ---');
  log.push(`Ara[0] (hadithnumber ${araM.hadiths[0].hadithnumber}): ${JSON.stringify(araM.hadiths[0])}`);
  log.push(`Ara[1] (hadithnumber ${araM.hadiths[1].hadithnumber}): ${JSON.stringify(araM.hadiths[1])}`);

  log.push('\n--- ENG HADITH INDEX 0 vs 1 ---');
  log.push(`Eng[0] (hadithnumber ${engM.hadiths[0].hadithnumber}): ${JSON.stringify(engM.hadiths[0])}`);
  log.push(`Eng[1] (hadithnumber ${engM.hadiths[1].hadithnumber}): ${JSON.stringify(engM.hadiths[1])}`);

  // Let's compare the text of Urd[0] vs Ara[0] vs Eng[0]
  log.push('\n--- TEXT CONTENT COMPARISON FOR FIRST HADITH ---');
  log.push('Ara[0] text: ' + araM.hadiths[0].text);
  log.push('Urd[0] text: ' + urdM.hadiths[0].text);
  log.push('Urd[1] text: ' + urdM.hadiths[1].text);
  log.push('Eng[0] text: ' + engM.hadiths[0].text);

  fs.writeFileSync('muslim_indexing.txt', log.join('\n'));
  console.log('DONE MUSLIM INDEXING');
}

run();
