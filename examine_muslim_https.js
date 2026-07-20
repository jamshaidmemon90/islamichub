const fs = require('fs');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';
  const [araM, urdM, engM] = await Promise.all([
    get(base + 'ara-muslim.min.json'),
    get(base + 'urd-muslim.min.json'),
    get(base + 'eng-muslim.min.json')
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

  log.push('\n--- TEXT CONTENT COMPARISON FOR FIRST HADITHS ---');
  log.push('Ara[0] (number 1): ' + araM.hadiths[0].text);
  log.push('Urd[0] (number 0): ' + urdM.hadiths[0].text);
  log.push('Urd[1] (number 1): ' + urdM.hadiths[1].text);
  log.push('Eng[0] (number 1): ' + engM.hadiths[0].text);

  fs.writeFileSync('muslim_https.txt', log.join('\n'));
  console.log('DONE HTTPS MUSLIM');
}

run();
