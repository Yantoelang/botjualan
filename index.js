// ======== AUTO-CONFIG by Mas YANTO ========
// #tag: nodemon-safety
process.on('SIGINT', () => {
  console.log('🛑 Deteksi Ctrl+C / Nodemon restart. Tutup KONTOL...');
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('🛑 Deteksi terminate signal. Tutup koneksi...');
  process.exit();
});

// #tag: nodemon-scan-protect
const fs = require('fs');
if (!fs.existsSync('./nodemon.json')) {
  fs.writeFileSync('./nodemon.json', JSON.stringify({
    watch: ["index.js", "costumer"],
    ignore: ["auth"],
    ext: "js,json",
    delay: "500"
  }, null, 2));
  console.log('📁 nodemon.json auto DIKONTOL');
}
// ========================================

const qrcode = require('qrcode-terminal');
const P = require('pino');
const moment = require('moment');
require('moment/locale/id');
moment.locale('id');

// #tag: backup-dependencies
const chalk = require('chalk');
const cron = require('node-cron');
const { exec } = require('child_process');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const pathCustomer = './costumer/trackerCustomer.json';

let customerTracker = {};
if (fs.existsSync(pathCustomer)) {
  try {
    customerTracker = JSON.parse(fs.readFileSync(pathCustomer));
  } catch (e) {
    customerTracker = {};
  }
}

function simpanCustomerTracker() {
  fs.writeFileSync(pathCustomer, JSON.stringify(customerTracker, null, 2));
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const logger = P({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  });

  const sock = makeWASocket({
    logger,
    auth: state,
    browser: ['Bot WA', 'Chrome', '1.0.0']
  });

  // #tag: creds-update
  sock.ev.on('creds.update', saveCreds);

  // #tag: conn-update
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.clear();
      console.log('\n📲 Scan QR berikut ini:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Koneksi terputus. Reconnect:', shouldReconnect);
      if (shouldReconnect) setTimeout(() => startSock(), 1000);
    } else if (connection === 'open') {
      console.log('✅ Bot terkoneksi ke WhatsApp');
    }
  });

// #tag: backup-auth-harian-gdrive
cron.schedule('0 0 * * *', () => {
    console.log('⏳ Backup auth ke Google Drive dimulai...');
    exec('rclone sync -P auth remote-gdrive-backup-auth:backup-wa/auth', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Gagal backup:', err.message);
            return;
        }
        if (stderr) console.error('⚠️ STDERR:', stderr);
        console.log('✅ Backup sukses BRO YANTO:\n', stdout);
    });
});

// #tag: auto-push-github-harian
cron.schedule('* * * * *', () => {
    console.log('⏳ Push update ke GitHub dimulai...');

    exec(`git add . && git commit -m "🕛 Auto backup & push by bot jam 00:00" && git push`, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Gagal push GitHub:', err.message);
            return;
        }
        if (stderr) console.error('⚠️ STDERR:', stderr);
        console.log('✅ PUSH SUKSES BRO YANTO:\n', stdout);
    });
});


  const recentMessages = new Set();

  // #tag: salam-otomatis
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const key = `${from}-${body}`;

    // Anti spam 5 detik
    if (recentMessages.has(key)) return;
    recentMessages.add(key);
    setTimeout(() => recentMessages.delete(key), 5000);

    // Waktu & salam
    const jam = moment().format('HH:mm');
    const hari = moment().format('dddd');
    const tanggal = moment().format('LL');
    const hour = moment().hour();

    let ucapan;
    if (hour >= 3 && hour < 10) ucapan = 'Selamat Pagi';
    else if (hour >= 10 && hour < 15) ucapan = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) ucapan = 'Selamat Sore';
    else ucapan = 'Selamat Malam';

    // Cek salam terakhir
    const now = Date.now();
    const lastSalam = customerTracker[from]?.lastSalam || 0;
    const bedaWaktu = now - lastSalam;

    if (bedaWaktu > 6 * 60 * 60 * 1000) {
      const salamVariasi = [
        `*${jam}* | *${hari}, ${tanggal}*\n\n${ucapan}, Saya Asisten Digitalnya Mas YANTO.\nAda Yang Bisa Saya Bantu? 🙏`,
        `*${jam}* | *${hari}, ${tanggal}*\n\nHai Kak 👋\n${ucapan}, Ada yang bisa dibantu oleh Asisten Digital Mas YANTO? 😊`,
        `*${jam}* | *${hari}, ${tanggal}*\n\n${ucapan}~\nSaya di sini buat bantu kamu kapan aja! ✨`
      ];

      const salam = salamVariasi[Math.floor(Math.random() * salamVariasi.length)];

      await delay(500);
      await sock.readMessages([msg.key]);
      await delay(500);
      await sock.sendMessage(from, { text: salam });

      if (!customerTracker[from]) customerTracker[from] = {};
      customerTracker[from].lastSalam = now;
      simpanCustomerTracker();
    }

    // Update tracker umum
    if (!customerTracker[from]) {
      customerTracker[from] = {
        firstSeen: now,
        lastSeen: now,
        totalChat: 1,
        lastSalam: now
      };
    } else {
      customerTracker[from].lastSeen = now;
      customerTracker[from].totalChat += 1;
    }

    simpanCustomerTracker();
  });
}

startSock();
