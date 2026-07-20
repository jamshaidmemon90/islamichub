const fs = require('fs');

async function run() {
  const ara = await (await fetch('https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-muslim.min.json')).json();
  const urd = await (await fetch('https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/urd-muslim.min.json')).json();
  const eng = await (await fetch('https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/eng-muslim.min.json')).json();

  let text = '=== ARA MUSLIM FIRST 3 ===\n' + JSON.stringify(ara.hadiths.slice(0, 3), null, 2) + '\n\n';
  text += '=== URD MUSLIM FIRST 3 ===\n' + JSON.stringify(urd.hadiths.slice(0, 3), null, 2) + '\n\n';
  text += '=== ENG MUSLIM FIRST 3 ===\n' + JSON.stringify(eng.hadiths.slice(0, 3), null, 2) + '\n\n';

  fs.writeFileSync('muslim_inspect.txt', text);
}
run();
