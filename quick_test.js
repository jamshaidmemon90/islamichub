const fs = require('fs');

async function testMuslim() {
  console.log('Downloading Muslim editions...');
  const base = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/main/editions/';
  const ara = await (await fetch(base + 'ara-muslim.min.json')).json();
  const urd = await (await fetch(base + 'urd-muslim.min.json')).json();
  const eng = await (await fetch(base + 'eng-muslim.min.json')).json();

  console.log('ARA length:', ara.hadiths.length);
  console.log('URD length:', urd.hadiths.length);
  console.log('ENG length:', eng.hadiths.length);

  console.log('\n--- First 10 ARA hadiths ---');
  ara.hadiths.slice(0, 10).forEach(h => console.log('hnum:', h.hadithnumber, 'ref:', JSON.stringify(h.reference), 'text:', (h.text||'').substring(0, 40)));

  console.log('\n--- First 10 URD hadiths ---');
  urd.hadiths.slice(0, 10).forEach(h => console.log('hnum:', h.hadithnumber, 'ref:', JSON.stringify(h.reference), 'text:', (h.text||'').substring(0, 40)));

  console.log('\n--- First 10 ENG hadiths ---');
  eng.hadiths.slice(0, 10).forEach(h => console.log('hnum:', h.hadithnumber, 'ref:', JSON.stringify(h.reference), 'text:', (h.text||'').substring(0, 40)));
}

testMuslim();
