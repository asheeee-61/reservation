const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

let clientReady = false;
let lastQR = null;
let lastQRAt = null;
let lastCheck = new Date();
let intentionalDisconnect = false;

let stats = {
    sent: 0,
    failed: 0,
    invalid: 0,
    pending: 0
};
let messageHistory = [];

const ts = () => new Date().toISOString();

const logMessage = (to, text, status, type = 'Notificación') => {
    messageHistory.unshift({
        recipient: to,
        text,
        status,
        type,
        timestamp: new Date().toLocaleString('es-ES')
    });
    if (messageHistory.length > 10) messageHistory.pop();

    if (status === 'sent') stats.sent++;
    if (status === 'failed') stats.failed++;
    if (status === 'invalid') stats.invalid++;
};

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.resolve(__dirname, '../sessions')
    }),
    webVersionCache: {
        type: 'local',
        path: path.resolve(__dirname, '../wwebjs_cache'),
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--disable-extensions',
        ],
        handleSIGINT: false,
        timeout: 60000,
    }
});

client.on('qr', (qr) => {
    lastQR = qr;
    lastQRAt = Date.now();
    console.log(`[${ts()}] 📱 QR code generated — scan at /qr`);
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log(`[${ts()}] 🔓 Authenticated to WhatsApp`);
});

client.on('auth_failure', (msg) => {
    console.error(`[${ts()}] ❌ [AUTH_FAILURE] Authentication failed: ${msg}`);
});

client.on('ready', () => {
    clientReady = true;
    lastCheck = new Date();
    console.log(`[${ts()}] ✅ WhatsApp client is ready`);
});

client.on('disconnected', (reason) => {
    clientReady = false;
    lastCheck = new Date();
    console.warn(`[${ts()}] 🔌 [DISCONNECTED] Reason: ${reason}`);
    if (!intentionalDisconnect) {
        console.log(`[${ts()}] 🔄 Reinitializing in 5s...`);
        setTimeout(() => {
            client.initialize().catch(err =>
                console.error(`[${ts()}] ❌ [REINIT_FAILED] ${err.message}`)
            );
        }, 5000);
    }
});

const formatClientMessage = (data) => {
    const { id, date, time, guests, customerName, tableType, specialEvent, businessName = 'Business' } = data;
    return `¡Hola ${customerName}! Hemos recibido tu reserva en ${businessName}.
📅 ${date} · 🕐 ${time} · 👥 ${guests} personas
🪑 ${tableType || 'Estándar'} · 🎉 ${specialEvent || 'Ninguno'}
Referencia: #${id}
Te confirmaremos en breve. ¡Gracias! 🍣`;
};

const formatAdminMessage = (data) => {
    const { id, date, time, guests, customerName, customerPhone, tableType, specialEvent } = data;
    return `🔔 Nueva reserva #${id}
👤 ${customerName} · 📱 ${customerPhone}
📅 ${date} · 🕐 ${time} · 👥 ${guests}
🪑 ${tableType || 'Estándar'} · 🎉 ${specialEvent || 'Ninguno'}
Estado: Pendiente ⏳`;
};

const sendMessage = async (to, text, type = 'Notificación') => {
    if (!to) {
        console.error(`[${ts()}] ❌ [MISSING_RECIPIENT] type=${type}`);
        throw new Error('Recipient phone number is required');
    }

    const toString = String(to).trim();
    if (!toString) {
        console.error(`[${ts()}] ❌ [EMPTY_RECIPIENT] type=${type}`);
        throw new Error('Recipient phone number is empty');
    }

    const chatId = toString.includes('@c.us')
        ? toString
        : `${toString.replace(/\D/g, '')}@c.us`;

    if (!clientReady) {
        console.error(`[${ts()}] ❌ [WA_NOT_READY] Cannot send ${type} to ${chatId} — client not connected`);
        logMessage(chatId, text, 'failed', type);
        throw new Error('WhatsApp client is not ready');
    }

    try {
        // Check if number is registered (non-fatal — LID errors bypass this)
        let isRegistered = true;
        try {
            isRegistered = await client.isRegisteredUser(chatId);
        } catch (checkErr) {
            console.warn(`[${ts()}] ⚠️ [REGISTERED_CHECK_FAILED] ${chatId} — ${checkErr.message} — attempting send anyway`);
        }

        if (!isRegistered) {
            console.warn(`[${ts()}] ⚠️ [NOT_ON_WHATSAPP] ${chatId} is not registered — skipping`);
            logMessage(chatId, text, 'invalid', type);
            throw new Error('Number is not registered on WhatsApp');
        }

        // Attempt send
        let result;
        try {
            result = await client.sendMessage(chatId, text);
        } catch (sendErr) {
            if (sendErr.message && sendErr.message.includes('No LID for user')) {
                console.warn(`[${ts()}] ⚠️ [NO_LID] ${chatId} — trying getNumberId fallback`);
                const numberId = await client.getNumberId(chatId);
                if (!numberId) {
                    console.warn(`[${ts()}] ⚠️ [NUMBER_NOT_FOUND] ${chatId} not found on WhatsApp — skipping`);
                    logMessage(chatId, text, 'invalid', type);
                    return;
                }
                console.log(`[${ts()}] 🔁 [LID_FALLBACK] Retrying send to ${numberId._serialized}`);
                result = await client.sendMessage(numberId._serialized, text);
            } else {
                throw sendErr;
            }
        }

        logMessage(chatId, text, 'sent', type);
        console.log(`[${ts()}] ✅ [SENT] type=${type} to=${chatId}`);
        return result;

    } catch (err) {
        if (err.message !== 'Number is not registered on WhatsApp') {
            console.error(`[${ts()}] ❌ [SEND_FAILED] type=${type} to=${chatId} — ${err.message}`);
            logMessage(chatId, text, 'failed', type);
        }
        throw err;
    }
};

const resendMessage = async (index) => {
    const msg = messageHistory[index];
    if (!msg) {
        console.error(`[${ts()}] ❌ [RESEND_FAILED] No message at index ${index}`);
        throw new Error('Message not found');
    }
    console.log(`[${ts()}] 🔁 [RESEND] Resending index=${index} type=${msg.type} to=${msg.recipient}`);
    return await sendMessage(msg.recipient, msg.text, msg.type);
};

const destroySession = async () => {
    intentionalDisconnect = true;
    clientReady = false;
    lastQR = null;
    console.log(`[${ts()}] 🗑️ [DESTROY_SESSION] Logging out and destroying client`);
    try { await client.logout(); } catch (_) {}
    try { await client.destroy(); } catch (_) {}
    setTimeout(() => {
        intentionalDisconnect = false;
        console.log(`[${ts()}] 🔄 [REINIT] Reinitializing after session destroy`);
        client.initialize().catch(err =>
            console.error(`[${ts()}] ❌ [REINIT_FAILED] ${err.message}`)
        );
    }, 5000);
};

module.exports = {
    client,
    sendMessage,
    formatClientMessage,
    formatAdminMessage,
    isReady: () => clientReady,
    getLastQR: () => lastQR,
    getLastQRAge: () => lastQRAt ? Math.floor((Date.now() - lastQRAt) / 1000) : null,
    getStats: () => ({ ...stats, lastCheck: lastCheck.toLocaleString('es-ES') }),
    getMessageHistory: () => messageHistory,
    resendMessage,
    destroySession
};
