const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const P = require('pino');

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
  });

  // ✅ QR SHOW HERE!
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.clear();
      console.log('📲 Scan QR ini bang Mas YANTO 🔥');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('❌ Disconnected. Reason:', reason);
      if (reason !== DisconnectReason.loggedOut) {
        startSock(); // 🔁 Reconnect
      } else {
        console.log('⛔ Logout. Hapus folder auth dan scan ulang QR!');
      }
    } else if (connection === 'open') {
      console.log('✅ Bot Mas YANTO CONNECTED ke WhatsApp!');
    }
  });

  // ✅ Pesan otomatis
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Bot Mas YANTO ON! Ada yang bisa dibantu?' });
  });

  sock.ev.on('creds.update', saveCreds);
}

startSock();
