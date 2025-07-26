const fs = require('fs');

const file = 'kontak.vcf';
const output = 'daftar-kontak.txt';

const data = fs.readFileSync(file, 'utf-8');
const contacts = data.split('BEGIN:VCARD');

let result = '';

contacts.forEach(contact => {
  let name = '';
  let phone = '';

  const lines = contact.split('\n');
  lines.forEach(line => {
    if (line.startsWith('FN:')) {
      name = line.replace('FN:', '').trim();
    }
    if (line.startsWith('TEL')) {
      const match = line.match(/:(.*)/);
      if (match) {
        phone = match[1].replace(/\s/g, '').trim();
      }
    }
  });

  if (name && phone) {
    result += `${name} | ${phone}\n`;
  }
});

fs.writeFileSync(output, result);
console.log(`✅ Konversi selesai. Disimpan di ${output}`);
