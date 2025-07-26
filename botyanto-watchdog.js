const { exec } = require('child_process');
const fs = require('fs');

const LOG_PATH = '/data/data/com.termux/files/home/.pm2/logs/botyanto-out.log';
const CHECK_INTERVAL = 60 * 1000; // 1 menit cek
const TIMEOUT_LIMIT = 5; // 5x cek = 5 menit
let offlineCount = 0;

// ========== FUNCTION: SEND TERMUX NOTIFICATION ========== //
function sendTermuxNotification(title, content) {
    exec(`termux-notification --title "${title}" --content "${content}" --priority high`, (err) => {
        if (err) console.error('❌ Failed to send Termux notification:', err.message);
    });
}

function checkBotHealth() {
    fs.readFile(LOG_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('❌ Gagal baca log:', err.message);
            return;
        }

        const isConnected = data.includes('✅ Bot berhasil TERHUBUNG ke WhatsApp!');
        const isDisconnected = data.includes('❌ Bot disconnect');

        if (isConnected) {
            offlineCount = 0;
            console.log('✅ Botyanto status: ONLINE');
        } else if (isDisconnected) {
            offlineCount++;
            console.log(`⚠️ Botyanto DISCONNECT detected. Count: ${offlineCount}/${TIMEOUT_LIMIT}`);
            if (offlineCount >= TIMEOUT_LIMIT) {
                console.log('🔄 Restarting PM2 botyanto (auto-recover)...');
                exec('pm2 restart botyanto', (err, stdout, stderr) => {
                    if (err) console.error('❌ Restart Failed:', err.message);
                    else {
                        console.log('✅ PM2 Restarted:', stdout);
                        sendTermuxNotification('Botyanto Status', '⚠️ Botyanto auto-restart karena disconnect.');
                    }
                });
                offlineCount = 0;
            }
        } else {
            console.log('⚠️ Tidak ada log connect/disconnect terdeteksi, asumsikan OFFLINE');
            offlineCount++;
            if (offlineCount >= TIMEOUT_LIMIT) {
                console.log('🔄 Restarting PM2 botyanto (auto-recover)...');
                exec('pm2 restart botyanto', (err, stdout, stderr) => {
                    if (err) console.error('❌ Restart Failed:', err.message);
                    else {
                        console.log('✅ PM2 Restarted:', stdout);
                        sendTermuxNotification('Botyanto Status', '⚠️ Botyanto auto-restart karena offline.');
                    }
                });
                offlineCount = 0;
            }
        }
    });
}

setInterval(checkBotHealth, CHECK_INTERVAL);
console.log('🟢 Botyanto Health Checker is Running...');

const cron = require('node-cron');

// ========== CRON: NOTIF ERROR LOG JAM 07:00 ========== //
cron.schedule('0 7 * * *', () => {
    console.log('🕖 Mengirim Error Summary Botyanto (Jam 7 Pagi)...');
    fs.readFile('/data/data/com.termux/files/home/.pm2/logs/botyanto-error.log', 'utf8', (err, data) => {
        if (err) {
            console.error('❌ Gagal baca error log:', err.message);
            return;
        }
        const last100Lines = data.trim().split('\n').slice(-100).join('\n');
        sendTermuxNotification('Botyanto Error Summary', last100Lines || 'Tidak ada error terbaru.');
    });
});

// ========== CRON: AUTO-CLEAR LOG JAM 00:01 ========== //
cron.schedule('0 0 * * *', () => {
    console.log('🧹 Auto-clear PM2 Log botyanto...');
    exec('pm2 flush', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Gagal flush log:', err.message);
            return;
        }
        console.log('✅ Log berhasil dibersihkan:', stdout);
        sendTermuxNotification('Botyanto Log Clear', '✅ Log Botyanto berhasil dibersihkan (00:01).');
    });
});

