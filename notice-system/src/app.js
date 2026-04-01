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

// Authentication middleware for UI routes
const tokenAuth = (req, res, next) => {
    const token = req.query.token;
    if (!token || token !== process.env.ADMIN_ACCESS_TOKEN) {
        return res.status(403).send(`
            <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fce8e6; color: #ea4335;">
                    <div style="text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1>Acceso denegado</h1>
                        <p>No tiene permisos para ver esta página.</p>
                    </div>
                </body>
            </html>
        `);
    }
    next();
};

const { renderMonitoring } = require('./monitoring');
const { resendMessage } = require('./whatsapp');

app.get('/', tokenAuth, (req, res) => {
    res.redirect(`/monitoring?token=${req.query.token}`);
});

app.get('/monitoring', tokenAuth, (req, res) => {
    res.send(renderMonitoring(process.env.BACKEND_URL));
});

app.get('/qr', tokenAuth, async (req, res) => {
    if (isReady()) {
        return res.send(`
            <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #e6f4ea; color: #34a853;">
                    <div style="text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1>✅ WhatsApp conectado</h1>
                        <p>El cliente ya está vinculado y listo.</p>
                        <a href="/monitoring?token=${req.query.token}" style="color: #1a73e8; text-decoration: none; font-weight: 500;">Volver al panel</a>
                    </div>
                </body>
            </html>
        `);
    }

    const qr = getLastQR();
    if (!qr) {
        return res.send(`
            <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f1f3f4;">
                    <div style="text-align: center;">
                        <h1>⏳ Esperando código QR...</h1>
                        <p>Por favor, recarga la página en unos segundos.</p>
                    </div>
                    <script>setTimeout(() => window.location.reload(), 5000);</script>
                </body>
            </html>
        `);
    }

    try {
        const qrImage = await QRCode.toDataURL(qr);
        res.send(`
            <html>
                <head>
                    <title>Vincular WhatsApp - Notice System</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
                </head>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Roboto', sans-serif; background: #f0f2f5; margin: 0;">
                    <div style="background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 400px;">
                        <h1 style="color: #25d366; margin-top: 0;">Vincular WhatsApp</h1>
                        <p style="color: #5f6368; margin-bottom: 2rem;">Escanea este código QR con el WhatsApp del restaurante.</p>
                        <div style="background: white; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; display: inline-block;">
                            <img src="${qrImage}" style="width: 280px; height: 280px; display: block;" />
                        </div>
                        <p style="margin-top: 1.5rem; color: #1a73e8; font-weight: 500;">Estado: Esperando escaneo...</p>
                        <div style="margin-top: 2rem; border-top: 1px solid #eee; pt: 1.5rem;">
                             <a href="/monitoring?token=${req.query.token}" style="color: #5f6368; font-size: 13px; text-decoration: none;">← Volver al panel</a>
                        </div>
                    </div>
                    <script>
                        setTimeout(() => window.location.reload(), 5000);
                    </script>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('<h1>Error generando QR code</h1>');
    }
});

app.post('/resend', tokenAuth, async (req, res) => {
    const { index } = req.body;
    try {
        await resendMessage(index);
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
