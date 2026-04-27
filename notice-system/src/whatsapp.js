const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

let clientReady = false;
let lastQR = null;
let lastCheck = new Date();
let intentionalDisconnect = false;

// Activity tracking
let stats = {
    sent: 0,
    failed: 0,
    invalid: 0,
    pending: 0
};
let messageHistory = [];

const logMessage = (to, text, status, type = 'Notificación') => {
    messageHistory.unshift({
        recipient: to,
        text,
        status, // 'sent', 'failed', 'invalid'
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
        dataPath: './sessions'
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        handleSIGINT: false,
    }
});

client.on('qr', (qr) => {
    lastQR = qr;
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
    clientReady = true;
});

client.on('authenticated', () => {
    console.log('🔓 Authenticated to WhatsApp');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failure:', msg);
});

client.on('disconnected', (reason) => {
    console.log('🔌 Client was logged out', reason);
    clientReady = false;
    lastCheck = new Date();
    if (!intentionalDisconnect) {
        client.initialize();
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
    clientReady = true;
    lastCheck = new Date();
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
        console.error(`❌ Cannot send WhatsApp: 'to' is undefined or null`);
        throw new Error("Recipient phone number is required");
    }

    // Format to WhatsApp ID (suffix @c.us for individuals)
    const toString = String(to).trim();
    if (!toString) {
        console.error(`❌ Cannot send WhatsApp: 'to' is an empty string`);
        throw new Error("Recipient phone number is empty");
    }

    const chatId = toString.includes('@c.us') ? toString : `${toString.replace(/\D/g, '')}@c.us`;

    if (!clientReady) {
        logMessage(chatId, text, 'failed', type);
        throw new Error('WhatsApp client is not ready');
    }
    try {
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            logMessage(chatId, text, 'invalid', type);
            throw new Error('Number is not registered on WhatsApp');
        }
        const result = await client.sendMessage(chatId, text);
        logMessage(chatId, text, 'sent', type);
        return result;
    } catch (err) {
        if (err.message !== 'Number is not registered on WhatsApp') {
            logMessage(chatId, text, 'failed', type);
        }
        throw err;
    }
};

const resendMessage = async (index) => {
    const msg = messageHistory[index];
    if (!msg) throw new Error('Message not found');
    return await sendMessage(msg.recipient, msg.text, msg.type);
};

const destroySession = async () => {
    intentionalDisconnect = true;
    clientReady = false;
    lastQR = null;
    try { await client.logout(); } catch (_) {}
    try { await client.destroy(); } catch (_) {}
    setTimeout(() => {
        intentionalDisconnect = false;
        client.initialize().catch(err => console.error('Failed to reinitialize WhatsApp:', err.message));
    }, 2000);
};

module.exports = {
    client,
    sendMessage,
    formatClientMessage,
    formatAdminMessage,
    isReady: () => clientReady,
    getLastQR: () => lastQR,
    getStats: () => ({ ...stats, lastCheck: lastCheck.toLocaleString('es-ES') }),
    getMessageHistory: () => messageHistory,
    resendMessage,
    destroySession
};
