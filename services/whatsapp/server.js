const express = require('express');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const AUTH_DIR = process.env.AUTH_DIR || path.join(__dirname, 'auth_info');

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock = null;
let currentQrDataUrl = null;
let currentQrRaw = null;
let isConnected = false;
let connectedPhone = null;

const logger = pino({ level: 'info' });

const messageStore = new Map();
const retryCounterCache = {
  data: new Map(),
  get(key) { return this.data.get(key); },
  set(key, val) { this.data.set(key, val); },
  del(key) { this.data.delete(key); },
  flushAll() { this.data.clear(); }
};

async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  logger.info(`Starting Baileys WhatsApp Gateway v${version.join('.')}...`);

  sock = makeWASocket({
    version,
    logger: pino({ level: 'warn' }),
    printQRInTerminal: true,
    auth: state,
    browser: ['Zeedo Marketplace', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    msgRetryCounterCache: retryCounterCache,
    getMessage: async (key) => {
      if (key && key.id && messageStore.has(key.id)) {
        return messageStore.get(key.id);
      }
      return undefined;
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQrRaw = qr;
      try {
        currentQrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
        logger.info('New WhatsApp pairing QR Code generated.');
      } catch (err) {
        logger.error('Failed to generate QR data URL:', err);
      }
    }

    if (connection === 'close') {
      isConnected = false;
      connectedPhone = null;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      logger.warn(`WhatsApp connection closed. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(initWhatsApp, 3000);
      } else {
        logger.error('WhatsApp session logged out. Clear auth_info and re-scan QR.');
        currentQrDataUrl = null;
        currentQrRaw = null;
        setTimeout(initWhatsApp, 5000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      currentQrDataUrl = null;
      currentQrRaw = null;
      connectedPhone = sock?.user?.id?.split(':')[0] || 'Unknown';
      logger.info(`✅ WhatsApp Gateway successfully CONNECTED as: +${connectedPhone}`);
    }
  });
}

// 1. Health Probe
app.get('/health', (req, res) => {
  res.json({
    status: isConnected ? 'healthy' : 'awaiting_qr_scan',
    isConnected,
    connectedPhone
  });
});

// 2. Status & QR API
app.get('/status', (req, res) => {
  res.json({
    isConnected,
    connectedPhone,
    hasQr: Boolean(currentQrDataUrl),
    qrDataUrl: currentQrDataUrl
  });
});

// 3. Visual QR HTML view (for direct phone scanning in browser)
app.get('/qr', (req, res) => {
  if (isConnected) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zeedo WhatsApp Gateway</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; color: white; margin: 0; text-align: center; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .badge { background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem; display: inline-block; margin-bottom: 1rem; }
            h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
            p { color: #94a3b8; font-size: 0.95rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Connected</span>
            <h1>WhatsApp Gateway Active</h1>
            <p>Linked Phone: <strong>+${connectedPhone}</strong></p>
            <p style="color:#64748b; font-size: 0.85rem; margin-top: 1.5rem;">Zeedo OTP Dispatcher running 24/7 on your server.</p>
          </div>
        </body>
      </html>
    `);
  }

  if (!currentQrDataUrl) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zeedo WhatsApp Gateway</title>
          <meta http-equiv="refresh" content="3">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; color: white; text-align: center; }
          </style>
        </head>
        <body>
          <div>
            <h2>Generating WhatsApp QR Code...</h2>
            <p>Page will refresh in 3 seconds...</p>
          </div>
        </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Scan WhatsApp QR — Zeedo</title>
        <meta http-equiv="refresh" content="20">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; color: white; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; max-width: 420px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          h1 { font-size: 1.4rem; margin: 0 0 0.5rem; }
          p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
          .qr-img { background: white; padding: 0.75rem; border-radius: 0.75rem; margin: 1.25rem 0; width: 280px; height: 280px; }
          .steps { text-align: left; background: #0f172a; padding: 1rem; border-radius: 0.5rem; font-size: 0.85rem; color: #cbd5e1; }
          .steps ol { margin: 0; padding-left: 1.25rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Link Zeedo WhatsApp Gateway</h1>
          <p>Scan this QR code with WhatsApp on your phone to send free buyer OTPs directly from your server.</p>
          <img class="qr-img" src="${currentQrDataUrl}" alt="WhatsApp QR Code" />
          <div class="steps">
            <ol>
              <li>Open <strong>WhatsApp</strong> on your phone</li>
              <li>Tap <strong>Settings</strong> &rarr; <strong>Linked Devices</strong></li>
              <li>Tap <strong>Link a Device</strong> & scan this QR</li>
            </ol>
          </div>
          <p style="font-size:0.75rem; color:#64748b; margin-top:1rem;">Page auto-refreshes every 20 seconds for fresh QR.</p>
        </div>
      </body>
    </html>
  `);
});

// 4. Send OTP / Message Endpoint
app.post('/send-otp', async (req, res) => {
  try {
    const { phone, code, message } = req.body;

    if (!phone) {
      return res.status(400).json({ isSuccess: false, message: 'Phone number is required' });
    }

    if (!isConnected || !sock) {
      return res.status(503).json({
        isSuccess: false,
        isGatewayOffline: true,
        message: 'WhatsApp Gateway is not linked yet. Scan QR code to connect.'
      });
    }

    // Format phone to WhatsApp JID (e.g. 9647501234567@s.whatsapp.net)
    const cleanPhone = phone.replace(/\D/g, '');
    const jid = `${cleanPhone}@s.whatsapp.net`;

    const textContent = message || [
      '🔒 *رمز التحقق لمنصة زيدو للمزادات*',
      '',
      `رمز الدخول الخاص بك: *${code}*`,
      '',
      '⏱️ الرمز صالح لمدة 10 دقائق.',
      '⚠️ لا تشارك هذا الرمز مع أي شخص لحماية حسابك.',
      '',
      '🌐 منصة زيدو — zeedo.bid'
    ].join('\n');

    logger.info(`Sending OTP to ${jid}...`);
    try {
      await sock.presenceSubscribe(jid);
      await sock.sendPresenceUpdate('available', jid);
    } catch (_) {
      // Non-blocking presence signal
    }

    const sent = await sock.sendMessage(jid, { text: textContent });

    if (sent?.key?.id && sent?.message) {
      messageStore.set(sent.key.id, sent.message);
      if (messageStore.size > 2000) {
        const oldestKey = messageStore.keys().next().value;
        messageStore.delete(oldestKey);
      }
    }

    return res.json({
      isSuccess: true,
      messageId: sent?.key?.id,
      phone: cleanPhone,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Failed to send WhatsApp message:', error);
    return res.status(500).json({
      isSuccess: false,
      message: error?.message || 'Internal error sending WhatsApp message'
    });
  }
});

app.listen(PORT, () => {
  logger.info(`Zeedo WhatsApp Gateway listening on port ${PORT}`);
  initWhatsApp().catch((err) => logger.error('Error initializing WhatsApp socket:', err));
});
