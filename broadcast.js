const fs = require('fs');
const readline = require('readline');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const delay = ms => new Promise(res => setTimeout(res, ms));

async function start() {
    const { state } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({ auth: state });

    rl.question('📣 Ketik pesan broadcast: ', async (pesan) => {
        const daftarKontak = fs.readFileSync('./daftar-kontak.txt', 'utf-8')
            .split('\n')
            .filter(x => x.includes('|'))
            .map(row => {
                const [nama, nomor] = row.split('|').map(x => x.trim());
                return { nama, jid: nomor + '@s.whatsapp.net' };
            });

        console.log(`📤 Mengirim Broadcast ke ${daftarKontak.length} target...`);
        for (const contact of daftarKontak) {
            await delay(1000); // delay anti-spam
            const pesanFinal = `Halo *${contact.nama}*,\n\n${pesan}`;
            await sock.sendMessage(contact.jid, { text: pesanFinal });
            console.log(`✅ Terkirim ke ${contact.nama} (${contact.jid})`);
        }
        rl.close();
        process.exit();
    });
}

start();
