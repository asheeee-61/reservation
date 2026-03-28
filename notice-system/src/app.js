const express = require('express');
const QRCode = require('qrcode');
const { sendMessage, formatClientMessage, formatAdminMessage, isReady, getLastQR } = require('./whatsapp');
require('dotenv').config();

const notifyRoutes = require('./notify');

const app = express();
app.use(express.json());

// Notify routes
app.use('/notify', notifyRoutes);

// CORS manual middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-secret');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Health check endpoint for Admin Dashboard
app.get('/health', (req, res) => {
    const ready = isReady();
    const qr = getLastQR();
    res.json({
        status: 'ok',
        whatsapp: {
            connected: ready,
            waitingQr: !!qr && !ready
        }
    });
});

const authMiddleware = (req, res, next) => {
    const secret = req.headers['x-api-secret'];
    if (!secret || secret !== process.env.API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Secret' });
    }
    next();
};

app.get('/', (req, res) => {
    res.redirect('/qr');
});

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

module.exports = app;
