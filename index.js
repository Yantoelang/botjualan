
const fs = require('fs');
const path = require('path');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const chalk = require('chalk');
const cron = require('node-cron');
const { exec } = require('child_process');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');

// ========== NODENAME SETUP ==========
process.on('SIGINT', () => {
  console.log('🛑 Ctrl+C ditekan. Bot dimatikan.');
  process.exit();
});
process.on('SIGTERM', () => {
  console.log('🛑 Terminate signal. Bot dimatikan.');
  process.exit();
});

if (!fs.existsSync('./nodemon.json')) {
  fs.writeFileSync('./nodemon.json', JSON.stringify({
    watch: ["index.js", "costumer"],
    ignore: ["auth"],
    ext: "js,json",
    delay: "500"
  }, null, 2));
  console.log('📁 nodemon.json auto dibuat.');
}

// ========== TRACKER COSTUMER ==========
moment.locale('id');
const pathCustomer = './costumer/trackerCustomer.json';
let customerTracker = {};
if (fs.existsSync(pathCustomer)) {
  try {
    customerTracker = JSON.parse(fs.readFileSync(pathCustomer));
  } catch { customerTracker = {}; }
}
function simpanCustomerTracker() {
  fs.writeFileSync(pathCustomer, JSON.stringify(customerTracker, null, 2));
}
const delay = ms => new Promise(res => setTimeout(res, ms));

// ========== START BOT ==========
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,

    auth: state,
    logger: P({ level: 'info' }),
    browser: ['Mas YantoBot', 'Chrome', '1.0']
  });

// === Qr kode === \\
sock.ev.on('connection.update', (update) => {
  const { qr } = update
  if (qr) {
    const qrcode = require('qrcode-terminal')
    qrcode.generate(qr, { small: true })
  }
})

sock.ev.on('creds.update', saveCreds);

<<<<<<< HEAD
sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
  if (connection === 'open') {
    console.log('✅ Bot berhasil TERHUBUNG ke WhatsApp!');
    
    // === FUNGSI TERUS ONLINE WA === \\
    try {
      await sock.sendPresenceUpdate('available');
      console.log('[Presence] WA diset ONLINE terus 🔥');
    } catch (err) {
      console.error('[Presence] Gagal set presence:', err);
=======
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Koneksi terputus. Reconnect:', shouldReconnect);
      if (shouldReconnect) setTimeout(() => startSock(), 1000);
    } else if (connection === 'open') {
      console.log('✅ Bot nya udah konek ke WA nih,bro YANTO');
>>>>>>> 31aa9fa (index.js)
    }
    // === FUNGSI LOG KALAU LOST KONEK === \\

  } else if (connection === 'close') {
    const reason = (lastDisconnect?.error)?.output?.statusCode;
    console.log(`❌ Bot disconnect (reason: ${reason})`);
    if (reason !== DisconnectReason.loggedOut) {
      startBot();
    } else {
      console.log('❌ Terlogout permanen. Scan ulang QR dibutuhkan!');
    }
  }
  });

// #tag: backup-auth-harian-gdrive

cron.schedule('0 0 * * *', () => {
    console.log('⏳ Backup auth ke Google Drive dimulai...');
    exec('rclone sync -P auth remote-gdrive-backup-auth:backup-wa/auth', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ GAGAL ASUU:', err.message);
            return;
        }
        if (stderr) console.error('⚠️ STDERR:', stderr);
        console.log('✅ Backup sukses BRO YANTO:\n', stdout);
    });
});

// #tag: auto-sync.sh github


    exec(`git add . && git commit -m "🕛 Auto backup & push by bot jam 00:00" && git push`, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Gagal push GitHub:', err.message);
            return;
        }
        if (stderr) console.error('⚠️ STDERR:', stderr);
        console.log('✅ PUSH SUKSES BRO YANTO:\n', stdout);
       (🕛 Auto backup & push by bot jam 00:01)});

  // ========== SALAM OTOMATIS ========== \\
  const recentMessages = new Set();
=======
cron.schedule('0 0 * * *', () => {
  console.log('[SYNC] Menjalankan auto sync...');
  exec('bash ~/botyanto/sync.sh', (err, stdout, stderr) => {
    if (err) {
      console.error(`[SYNC ERROR] ${err.message}`);
      return;
    }
    if (stderr) {
      console.error(`[SYNC STDERR] ${stderr}`);
    }
    console.log(`[SYNC RESULT] ${stdout}`);
  });
});

// #tag: salam-otomatis-dari-BOT

const recentMessages = new Set();

>>>>>>> 31aa9fa (index.js)
  sock.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;


    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const key = `${from}-${body}`;
    if (recentMessages.has(key)) return;
    recentMessages.add(key);
    setTimeout(() => recentMessages.delete(key), 10000);

    const jam = moment().format('HH:mm');
    const hari = moment().format('dddd');
    const tanggal = moment().format('LL');
    const hour = moment().hour();

    let ucapan;
    if (hour >= 4 && hour < 10) ucapan = 'Selamat Pagi';
    else if (hour >= 10 && hour < 15) ucapan = 'Selamat Siang';
    else if (hour >= 15 && hour < 19) ucapan = 'Selamat Sore';
    else ucapan = 'Selamat Malam';

    const now = Date.now();
    const lastSalam = customerTracker[from]?.lastSalam || 0;
    const bedaWaktu = now - lastSalam;

    if (bedaWaktu > 10 * 60  * 1000) {
      const salamVariasi = [
        `*${jam}* | *${hari}, ${tanggal}*\n\n${ucapan}, Saya Asisten Digitalnya Mas YANTO. Ada Yang Bisa Di Bantu? 🙏`,
        `*${jam}* | *${hari}, ${tanggal}*\n\nHalo Kak 👋 ${ucapan}! Orangnya Lagi Ngarit, Nanti Saya Kabari Yahh😊`,
        `*${jam}* | *${hari}, ${tanggal}*\n\n${ucapan}~ He.He.He..Nanti Saya Panggilkan Mas Yanto ,Tunggu Yahh..`
      ];
      const salam = salamVariasi[Math.floor(Math.random() * salamVariasi.length)];
      await delay(2000);
      await sock.readMessages([msg.key]);
      await delay(2000);
      await sock.sendMessage(from, { text: salam });
=======
  const from = msg.key.remoteJid;
  const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  const key = `${from}-${body}`;

  // #tag: anti-spam-5detik
  if (recentMessages.has(key)) return;
  recentMessages.add(key);
  setTimeout(() => recentMessages.delete(key), 5000);

  // #tag: salam-info-waktu
  const jam = moment().format('HH:mm');
  const hari = moment().format('dddd');
  const tanggal = moment().format('LL');
  const hour = moment().hour();

  let ucapan;
  if (hour >= 3 && hour < 10) ucapan = 'Pagi';
  else if (hour >= 10 && hour < 15) ucapan = 'Siang';
  else if (hour >= 15 && hour < 18) ucapan = 'Sore';
  else ucapan = 'Malam';

  // #tag: salam-cek-waktu
  const now = Date.now();
  const lastSalam = customerTracker[from]?.lastSalam || 0;
  const bedaWaktu = now - lastSalam;

  if (bedaWaktu > 10 * 60 * 1000) { // 10 menit
    // #tag: salam-berantai-pola
    const polaSalam = [
      [
        `*${jam}* | *${hari}, ${tanggal}*\n\nHalo kak, saya Asisten Digitalnya Mas YANTO 👋`,
        `Saya siap bantu kebutuhan kakak hari ini 😊`,
        `Silakan langsung tulis pertanyaan atau pesanan ya 🙏`
      ],
      [
        `*${jam}* | *${hari}, ${tanggal}*\n\nHai Kak 👋`,
        `Selamat ${ucapan}, saya Asisten Digital dari Mas YANTO`,
        `Kalau ada yang bisa dibantu langsung aja tulis pesan ya 📝`
      ],
      [
        `*${jam}* | *${hari}, ${tanggal}*\n\nSelamat ${ucapan} ☀️`,
        `Asisten Mas YANTO hadir menemani kakak hari ini`,
        `Yuk mulai interaksi, saya siap bantu 😎`
      ]
    ];

    const salam = polaSalam[Math.floor(Math.random() * polaSalam.length)];

    await delay(500);
    await sock.readMessages([msg.key]);

    // #tag: salam-berantai-delay
    setTimeout(() => {
      sock.sendMessage(from, { text: salam[0] });
    }, 3000); // 3 detik

    setTimeout(() => {
      sock.sendMessage(from, { text: salam[1] });
    }, 8000); // 8 detik

    setTimeout(() => {
      sock.sendMessage(from, { text: salam[2] });
>>>>>>> 31aa9fa (index.js)
      if (!customerTracker[from]) customerTracker[from] = {};
      customerTracker[from].lastSalam = now;
      simpanCustomerTracker();
    }, 18000); // 18 detik
  }


    // ===  Tracker update === \\
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

  // ========== AUTO BACKUP GOOGLE DRIVE ========== \\
  cron.schedule('0 0 * * *', () => {
    console.log('⏳ Backup auth ke Google Drive dimulai...');
    exec('rclone sync -P auth remote-gdrive-backup-auth:backup-wa/auth', (err, stdout, stderr) => {
      if (err) return console.error('❌ Gagal backup:', err.message);
      if (stderr) console.error('⚠️ STDERR:', stderr);
      console.log('✅ Backup sukses ke G.Drive Bro Yanto:\n', stdout);
    });
  });

  // ========== AUTO PUSH GITHUB ========== \\
  cron.schedule('0 0 * * *', () => {
    console.log('⏳ Auto push ke GitHub dimulai...');
    exec(`git add . && git commit -m "🕛 Auto backup & push by bot jam 00:00" && git push`, (err, stdout, stderr) => {
      if (err) return console.error('❌ Gagal push GitHub:', err.message);
      if (stderr) console.error('⚠️ STDERR:', stderr);
      console.log('✅ PUSH ke GitHub Bro Yanto:\n', stdout);
    });
  });
=======
  // #tag: tracker-user
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
>>>>>>> 31aa9fa (index.js)
}

startBot();
