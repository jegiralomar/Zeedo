const express = require('express');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  proto
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
const MESSAGE_STORE_PATH = path.join(AUTH_DIR, 'persistent_message_store.json');

// Load stored messages from disk on startup so retries survive container restarts
function loadPersistentMessages() {
  try {
    if (fs.existsSync(MESSAGE_STORE_PATH)) {
      const raw = fs.readFileSync(MESSAGE_STORE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      for (const [k, v] of Object.entries(data)) {
        messageStore.set(k, v);
      }
      logger.info(`Loaded ${messageStore.size} persistent messages from disk.`);
    }
  } catch (err) {
    logger.warn('Could not load persistent message store:', err.message);
  }
}

// Debounced flush of message store to disk
let saveTimeout = null;
function persistMessageStore() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const obj = {};
      const entries = Array.from(messageStore.entries()).slice(-2000);
      for (const [k, v] of entries) {
        obj[k] = v;
      }
      fs.writeFileSync(MESSAGE_STORE_PATH, JSON.stringify(obj), 'utf-8');
    } catch (err) {
      logger.warn('Failed to save message store to disk:', err.message);
    }
  }, 1000);
}

/**
 * 12-Hour Auto-Healing Daemon:
 * Purges orphaned pre-key files older than 3 days while keeping creds.json intact.
 * Prevents corrupted single-use pre-keys from accumulating over weeks/months.
 */
function startAutoHealingDaemon() {
  const SWEEP_INTERVAL = 12 * 60 * 60 * 1000; // Every 12 hours
  const MAX_PREKEY_AGE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

  setInterval(() => {
    try {
      if (!fs.existsSync(AUTH_DIR)) return;
      const files = fs.readdirSync(AUTH_DIR);
      const now = Date.now();
      let pruned = 0;

      for (const file of files) {
        if (file === 'creds.json' || file === 'persistent_message_store.json') continue;

        if (file.startsWith('pre-key-') || file.startsWith('session-') || file.startsWith('sender-key-')) {
          const filePath = path.join(AUTH_DIR, file);
          try {
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > MAX_PREKEY_AGE_MS) {
              fs.unlinkSync(filePath);
              pruned++;
            }
          } catch (_) {}
        }
      }

      if (pruned > 0) {
        logger.info(`🧹 [Auto-Healing Daemon] Purged ${pruned} stale pre-key/session files older than 3 days.`);
      }
    } catch (err) {
      logger.warn('[Auto-Healing Daemon] Error during pre-key sweep:', err.message);
    }
  }, SWEEP_INTERVAL);
}

// TTL cache for message retries to prevent unbounded growth and permanently stuck retry counters
class TtlCache {
  constructor(ttlMs = 15 * 60 * 1000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.val;
  }
  set(key, val) {
    this.store.set(key, { val, expiry: Date.now() + this.ttlMs });
    if (this.store.size > 5000) {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (now > v.expiry) this.store.delete(k);
      }
    }
  }
  del(key) {
    this.store.delete(key);
  }
  flushAll() {
    this.store.clear();
  }
}
const retryCounterCache = new TtlCache();

async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  logger.info(`Starting Baileys WhatsApp Gateway v${version.join('.')}...`);

  const silentLogger = pino({ level: 'silent' });

  sock = makeWASocket({
    version,
    logger: silentLogger,
    auth: {
      creds: state.creds,
      // Wrap with makeCacheableSignalKeyStore to prevent pre-key desynchronization and race conditions
      keys: makeCacheableSignalKeyStore(state.keys, silentLogger)
    },
    browser: Browsers.macOS('Chrome'),
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
    msgRetryCounterCache: retryCounterCache,
    getMessage: async (key) => {
      logger.info(`[RETRY-REQUEST] WhatsApp requested retry for message ID: ${key?.id}`);
      if (key?.id && messageStore.has(key.id)) {
        const msg = messageStore.get(key.id);
        logger.info(`[RETRY-REQUEST] Successfully served stored message for ID: ${key.id}`);
        return typeof msg === 'string' ? { conversation: msg } : msg;
      }
      logger.warn(`[RETRY-REQUEST] Message ID not found in store, returning empty proto: ${key?.id}`);
      return proto.Message.fromObject({});
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Store ALL messages (sent + received) so getMessage can serve retries
  sock.ev.on('messages.upsert', ({ messages }) => {
    let hasNew = false;
    for (const msg of messages) {
      if (msg.key?.id && msg.message) {
        messageStore.set(msg.key.id, msg.message);
        hasNew = true;
        if (messageStore.size > 5000) {
          const oldest = messageStore.keys().next().value;
          messageStore.delete(oldest);
        }
      }
    }
    if (hasNew) persistMessageStore();
  });

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
      try {
        await sock.sendPresenceUpdate('available');
      } catch (_) {}
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
    let jid = `${cleanPhone}@s.whatsapp.net`;

    // Handle LID and Phone Number Mapping (especially for iOS and multi-device accounts)
    try {
      const [contact] = await sock.onWhatsApp(cleanPhone);
      if (contact?.exists && contact?.jid) {
        jid = contact.jid;
        logger.info(`Resolved ${cleanPhone} to verified WhatsApp JID: ${jid}`);
      }
    } catch (checkErr) {
      logger.debug(`Presence/LID lookup skipped for ${cleanPhone}:`, checkErr?.message);
    }

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
    const botPhone = sock?.user?.id?.split(':')[0]?.replace(/\D/g, '');
    if (botPhone && cleanPhone !== botPhone) {
      try {
        await sock.presenceSubscribe(jid);
        await sock.sendPresenceUpdate('available', jid);
      } catch (_) {
        // Non-blocking presence signal
      }
    }

    const sent = await sock.sendMessage(jid, { text: textContent });

    if (sent?.key?.id) {
      messageStore.set(sent.key.id, sent.message || { conversation: textContent });
      persistMessageStore();
      if (messageStore.size > 5000) {
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

// Helper to remove pre-keys and session files
function clearSessionFiles(keepCreds = true) {
  if (!fs.existsSync(AUTH_DIR)) return { deleted: 0 };
  const files = fs.readdirSync(AUTH_DIR);
  let deleted = 0;
  for (const file of files) {
    if (keepCreds && file === 'creds.json') {
      continue; // Preserve device pairing credentials
    }
    try {
      fs.unlinkSync(path.join(AUTH_DIR, file));
      deleted++;
    } catch (err) {
      logger.warn(`Failed to delete session file ${file}:`, err.message);
    }
  }
  return { deleted };
}

// 5. Clear Corrupted Sessions — removes stale pre-keys while PRESERVING creds.json
// This forces a fresh Signal encryption handshake without requiring a QR code re-scan!
app.post('/clear-corrupted-sessions', async (req, res) => {
  try {
    logger.warn('🧹 Stale pre-key and session cleanup requested. Preserving creds.json...');
    if (sock) {
      try { sock.end(); } catch (_) {}
      sock = null;
    }
    isConnected = false;
    connectedPhone = null;

    const { deleted } = clearSessionFiles(true);
    messageStore.clear();
    retryCounterCache.flushAll();

    setTimeout(() => {
      initWhatsApp().catch((err) => logger.error('Error re-initializing WhatsApp after session clean:', err));
    }, 1500);

    return res.json({
      isSuccess: true,
      message: `Cleared ${deleted} corrupted session/pre-key files while keeping creds.json intact. Fresh encryption handshake initiated.`,
      deletedFiles: deleted
    });
  } catch (err) {
    logger.error('Failed to clear corrupted sessions:', err);
    return res.status(500).json({ isSuccess: false, message: err.message });
  }
});

// 6. Reset session — clears auth_info (or optionally keeps creds with keepCreds=true)
app.post('/reset-session', async (req, res) => {
  try {
    const keepCreds = req.query.keepCreds === 'true' || req.body?.keepCreds === true;
    logger.warn(`🔄 Session reset requested. keepCreds: ${keepCreds}...`);
    if (sock) {
      try { sock.end(); } catch (_) {}
      sock = null;
    }
    isConnected = false;
    connectedPhone = null;
    currentQrDataUrl = null;
    currentQrRaw = null;

    const { deleted } = clearSessionFiles(keepCreds);
    messageStore.clear();
    retryCounterCache.flushAll();

    // Re-init after a brief delay
    setTimeout(() => {
      initWhatsApp().catch((err) => logger.error('Error re-initializing WhatsApp:', err));
    }, 1500);

    return res.json({
      isSuccess: true,
      message: keepCreds
        ? `Preserved creds.json. Cleared ${deleted} session files.`
        : 'All auth data cleared. Scan new QR at /qr',
      deletedFiles: deleted
    });
  } catch (err) {
    logger.error('Reset failed:', err);
    return res.status(500).json({ isSuccess: false, message: err.message });
  }
});

app.listen(PORT, () => {
  logger.info(`Zeedo WhatsApp Gateway listening on port ${PORT}`);
  loadPersistentMessages();
  startAutoHealingDaemon();
  initWhatsApp().catch((err) => logger.error('Error initializing WhatsApp socket:', err));
});
