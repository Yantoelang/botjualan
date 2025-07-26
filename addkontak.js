const fs = require('fs');

const nama = process.argv[2];
const nomor = process.argv[3];

if (!nama || !nomor) {
  console.log('❌ Format salah!\nContoh: node addkontak.js Budi 081234567890');
  process.exit(1);
}

const kontak = `${nama} | ${nomor}\n`;
fs.appendFile('daftar-kontak.txt', kontak, (err) => {
  if (err) {
    console.error('❌ Gagal menyimpan:', err);
  } else {
    console.log('✅ Kontak berhasil ditambahkan!');
  }
});
