const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

let clientReady = false;
let lastQR = null;

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
    client.initialize();
});

const formatClientMessage = (data) => {
    const { id, date, time, guests, customerName, tableType, specialEvent } = data;
    return `¡Hola ${customerName}! Hemos recibido tu reserva en Hotaru Madrid.
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

const sendMessage = async (to, text) => {
    if (!clientReady) {
        throw new Error('WhatsApp client is not ready');
    }
    // Format to WhatsApp ID (suffix @c.us for individuals)
    const chatId = to.includes('@c.us') ? to : `${to.replace(/\D/g, '')}@c.us`;
    return await client.sendMessage(chatId, text);
};

module.exports = {
    client,
    sendMessage,
    formatClientMessage,
    formatAdminMessage,
    isReady: () => clientReady,
    getLastQR: () => lastQR
};
