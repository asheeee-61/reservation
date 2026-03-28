const express = require('express');
const QRCode = require('qrcode');
const { sendMessage, formatClientMessage, formatAdminMessage, isReady, getLastQR } = require('./whatsapp');
require('dotenv').config();

const app = express();
app.use(express.json());

const API_SECRET = process.env.API_SECRET;

const authMiddleware = (req, res, next) => {
    const secret = req.headers['x-api-secret'];
    if (!secret || secret !== API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Secret' });
    }
    next();
};

app.get('/qr', async (req, res) => {
    if (isReady()) {
        return res.send('<h1>✅ WhatsApp client is already ready!</h1>');
    }

    const qr = getLastQR();
    if (!qr) {
        return res.send('<h1>⏳ Waiting for QR code... Please refresh in a moment.</h1>');
    }

    try {
        const qrImage = await QRCode.toDataURL(qr);
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f0f2f5;">
                    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
                        <h1 style="color: #25d366;">WhatsApp Auth</h1>
                        <p>Scan this QR code with your dedicated WhatsApp number.</p>
                        <img src="${qrImage}" style="width: 300px; height: 300px; border: 1px solid #ddd; padding: 10px; border-radius: 8px;" />
                        <p style="margin-top: 1rem; color: #666;">Status: Waiting for scan...</p>
                    </div>
                    <script>
                        setTimeout(() => window.location.reload(), 5000);
                    </script>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('<h1>Error generating QR code</h1>');
    }
});

app.post('/notify/new-reservation', authMiddleware, async (req, res) => {
    const { reservation, customer, tableType, specialEvent, adminPhone } = req.body;

    if (!reservation || !customer) {
        return res.status(400).json({ error: 'Missing reservation or customer data' });
    }

    const data = {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        customerName: customer.name,
        customerPhone: customer.phone,
        tableType: tableType ? tableType.name : null,
        specialEvent: specialEvent ? specialEvent.name : null
    };

    try {
        const clientMsg = formatClientMessage(data);
        const adminMsg = formatAdminMessage(data);

        // Determine target for testing/admin
        const targetAdmin = process.env.TEST_PHONE || adminPhone;
        const targetClient = process.env.TEST_PHONE || customer.phone;

        // Fire and forget (optional, but requested avoid blocking)
        // Here we send them and wait for the promises to settle but we don't care if one fails specifically if we have a log
        const results = await Promise.allSettled([
            sendMessage(targetClient, clientMsg),
            sendMessage(targetAdmin, adminMsg)
        ]);

        console.log(`Notification sent for reservation #${reservation.id}`);
        res.json({ status: 'sent', details: results });
    } catch (err) {
        console.error('Failed to send notification:', err.message);
        res.status(500).json({ error: 'Failed to send WhatsApp message', details: err.message });
    }
});

module.exports = app;
