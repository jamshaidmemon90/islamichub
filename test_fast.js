const fs = require('fs');

async function main() {
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';
  const [araM, urdM, engM] = await Promise.all([
    fetch(base + 'ara-muslim.min.json').then(r=>r.json()),
    fetch(base + 'urd-muslim.min.json').then(r=>r.json()),
    fetch(base + 'eng-muslim.min.json').then(r=>r.json())
  ]);

  let log = `MAIN BRANCH MUSLIM:\n`;
  log += `Arabic hadiths count: ${araM.hadiths.length}\n`;
  log += `Urdu hadiths count:   ${urdM.hadiths.length}\n`;
  log += `English hadiths count:${engM.hadiths.length}\n\n`;

  log += `Arabic Hadith #1: ${JSON.stringify(araM.hadiths[0])}\n`;
  log += `Urdu Hadith #0:   ${JSON.stringify(urdM.hadiths[0])}\n`;
  log += `Urdu Hadith #1:   ${JSON.stringify(urdM.hadiths[1])}\n\n`;

  // Compare hadithnumber 1 to 5 across all 3
  for (let i = 1; i <= 5; i++) {
    const a = araM.hadiths.find(h => h.hadithnumber === i);
    const u = urdM.hadiths.find(h => h.hadithnumber === i);
    const e = engM.hadiths.find(h => h.hadithnumber === i);
    log += `--- HADITHNUMBER ${i} ---\n`;
    log += `  ARA text: ${a ? a.text.slice(0, 60) : 'NONE'}\n`;
    log += `  URD text: ${u ? u.text.slice(0, 60) : 'NONE'}\n`;
    log += `  ENG text: ${e ? e.text.slice(0, 60) : 'NONE'}\n`;
  }

  fs.writeFileSync('fast_out.txt', log);
  console.log('DONE FAST');
}

main();
