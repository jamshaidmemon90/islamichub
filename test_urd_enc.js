const fs = require('fs');

async function run() {
  const res = await fetch('https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/urd-muslim.min.json');
  const urd = await res.json();
  fs.writeFileSync('urd_sample.txt', urd.hadiths[3].text, 'utf-8');
  console.log('DONE URD SAMPLE');
}
run();
