const express = require('express');
const QRCode = require('qrcode');
const { sendMessage, formatClientMessage, formatAdminMessage, isReady, getLastQR, getLastQRAge } = require('./whatsapp');
require('dotenv').config();

const notifyRoutes = require('./notify');

const app = express();
app.use(express.json());

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

// Notify routes
app.use('/notify', notifyRoutes);

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
                <head>
                    <title>Acceso Denegado - Notice System</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                </head>
                <body style="font-family: 'Roboto', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F5F5F5; margin: 0;">
                    <div style="text-align: center; background: white; padding: 3rem; border-radius: 12px; box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12); max-width: 400px; width: 90%;">
                        <span class="material-icons" style="font-size: 64px; color: #D32F2F; margin-bottom: 1rem;">block</span>
                        <h1 style="font-size: 24px; font-weight: 500; color: #202124; margin: 0 0 1rem 0;">Acceso denegado</h1>
                        <p style="color: #5F6368; line-height: 1.5; margin-bottom: 0;">No tiene permisos para ver esta página o el token es inválido.</p>
                    </div>
                </body>
            </html>
        `);

    }
    next();
};

const { renderMonitoring } = require('./monitoring');
const { resendMessage, destroySession } = require('./whatsapp');

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
                <head>
                    <title>WhatsApp Conectado - Notice System</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                </head>
                <body style="font-family: 'Roboto', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F5F5F5; margin: 0;">
                    <div style="text-align: center; background: white; padding: 3rem; border-radius: 12px; box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12); max-width: 400px; width: 90%;">
                        <span class="material-icons" style="font-size: 64px; color: #388E3C; margin-bottom: 1rem;">check_circle</span>
                        <h1 style="font-size: 24px; font-weight: 500; color: #202124; margin: 0 0 1rem 0;">WhatsApp Conectado</h1>
                        <p style="color: #5F6368; line-height: 1.5; margin-bottom: 2rem;">El cliente ya está vinculado y funcionando correctamente.</p>
                        <a href="/monitoring?token=${req.query.token}" style="display: inline-flex; align-items: center; gap: 8px; background: #1a73e8; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.75px; font-size: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);">
                            <span class="material-icons" style="font-size: 18px;">dashboard</span>
                            Volver al panel
                        </a>

                    </div>
                </body>
            </html>
        `);

    }

    const qr = getLastQR();
    const qrAge = getLastQRAge();
    const qrExpired = qrAge !== null && qrAge > 60;
    if (!qr || qrExpired) {
        return res.send(`
            <html>
                <head>
                    <title>Esperando QR - Notice System</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                </head>
                <body style="font-family: 'Roboto', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F5F5F5; margin: 0;">
                    <div style="text-align: center; max-width: 420px; width: 90%;">
                        <div style="background: white; padding: 3rem; border-radius: 12px; box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);">
                            <span class="material-icons" style="font-size: 64px; color: #1a73e8; margin-bottom: 1rem; animation: pulse 2s infinite;">hourglass_empty</span>
                            <h1 style="font-size: 24px; font-weight: 500; color: #202124; margin: 0 0 1rem 0;">Generando código QR...</h1>
                            <p style="color: #5F6368; line-height: 1.5; margin-bottom: 1.5rem;">Por favor, espera unos segundos mientras preparamos la conexión.</p>
                            <button onclick="forceNewQR()" style="background:#1a73e8;color:white;border:none;padding:10px 20px;border-radius:4px;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
                                <span class="material-icons" style="font-size:16px;">refresh</span> Forzar nuevo QR
                            </button>
                        </div>
                    </div>
                    <style>@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }</style>
                    <script>
                        setTimeout(() => window.location.reload(), 4000);
                        function forceNewQR() {
                            fetch('/disconnect?token=${req.query.token}', { method: 'POST' })
                                .then(() => { setTimeout(() => window.location.reload(), 2500); })
                                .catch(() => window.location.reload());
                        }
                    </script>
                </body>
            </html>
        `);
    }

    try {
        const qrImage = await QRCode.toDataURL(qr);
        const remainingSeconds = qrAge !== null ? Math.max(0, 60 - qrAge) : 60;
        res.send(`
            <html>
                <head>
                    <title>Vincular WhatsApp - Notice System</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                    <style>
                        body {
                            margin: 0;
                            font-family: 'Roboto', sans-serif;
                            background-color: #F5F5F5;
                            display: flex;
                            flex-direction: column;
                            min-height: 100vh;
                            color: #202124;
                        }
                        .header {
                            height: 56px;
                            background: white;
                            display: flex;
                            align-items: center;
                            padding: 0 24px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 20px;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        .main {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 24px;
                        }
                        .qr-card {
                            background: white;
                            padding: 32px;
                            border-radius: 12px;
                            box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
                            text-align: center;
                            max-width: 420px;
                            width: 100%;
                        }
                        .instruction {
                            color: #5F6368;
                            margin: 16px 0 20px;
                            font-size: 15px;
                            line-height: 1.5;
                        }
                        .qr-container {
                            position: relative;
                            background: white;
                            padding: 16px;
                            border: 1px solid #E0E0E0;
                            border-radius: 8px;
                            display: inline-block;
                            margin-bottom: 20px;
                        }
                        .qr-container.expired::after {
                            content: '';
                            position: absolute;
                            inset: 0;
                            background: rgba(255,255,255,0.85);
                            border-radius: 8px;
                        }
                        .qr-image {
                            width: 100%;
                            max-width: 260px;
                            height: auto;
                            display: block;
                        }
                        .timer-row {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            margin-bottom: 16px;
                        }
                        .timer-badge {
                            display: inline-flex;
                            align-items: center;
                            gap: 5px;
                            padding: 5px 12px;
                            border-radius: 20px;
                            font-size: 13px;
                            font-weight: 600;
                            background: #E8F0FE;
                            color: #1a73e8;
                            transition: background 0.3s, color 0.3s;
                        }
                        .timer-badge.warning {
                            background: #FFF3E0;
                            color: #E65100;
                        }
                        .timer-badge.danger {
                            background: #FDECEA;
                            color: #C62828;
                        }
                        .progress-bar-track {
                            width: 100%;
                            height: 4px;
                            background: #E0E0E0;
                            border-radius: 4px;
                            margin-bottom: 20px;
                            overflow: hidden;
                        }
                        .progress-bar-fill {
                            height: 100%;
                            border-radius: 4px;
                            background: #1a73e8;
                            transition: width 1s linear, background 0.3s;
                        }
                        .status {
                            color: #1a73e8;
                            font-weight: 500;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            margin-bottom: 20px;
                        }
                        .force-btn {
                            background: none;
                            border: 1px solid #DADCE0;
                            color: #5F6368;
                            padding: 8px 16px;
                            border-radius: 4px;
                            font-size: 13px;
                            cursor: pointer;
                            display: inline-flex;
                            align-items: center;
                            gap: 5px;
                            font-family: 'Roboto', sans-serif;
                        }
                        .force-btn:hover { background: #F5F5F5; }
                        @keyframes blink { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>
                            <span class="material-icons" style="color: #1a73e8;">notifications_active</span>
                            Notice System
                        </h1>
                    </div>
                    <div class="main">
                        <div class="qr-card">
                            <h2 style="margin: 0; font-size: 22px; font-weight: 500;">Vincular Dispositivo</h2>
                            <p class="instruction">Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos vinculados</strong> y escanea este código.</p>

                            <div class="timer-row">
                                <span class="timer-badge" id="timerBadge">
                                    <span class="material-icons" style="font-size:14px;">timer</span>
                                    <span id="timerText">Expira en <span id="countdown">${remainingSeconds}</span>s</span>
                                </span>
                            </div>

                            <div class="progress-bar-track">
                                <div class="progress-bar-fill" id="progressBar" style="width: ${Math.round((remainingSeconds / 60) * 100)}%"></div>
                            </div>

                            <div class="qr-container" id="qrContainer">
                                <img src="${qrImage}" class="qr-image" id="qrImg" />
                            </div>

                            <div class="status">
                                <span class="material-icons" style="font-size: 18px; animation: blink 1.5s infinite;">sync</span>
                                Esperando escaneo...
                            </div>

                            <button class="force-btn" onclick="forceNewQR()">
                                <span class="material-icons" style="font-size:15px;">refresh</span>
                                Generar nuevo QR
                            </button>
                        </div>
                    </div>
                    <script>
                        let remaining = ${remainingSeconds};
                        const countdownEl = document.getElementById('countdown');
                        const badgeEl = document.getElementById('timerBadge');
                        const progressEl = document.getElementById('progressBar');
                        const containerEl = document.getElementById('qrContainer');
                        const timerTextEl = document.getElementById('timerText');

                        const tick = setInterval(() => {
                            remaining--;
                            countdownEl.textContent = remaining;
                            const pct = Math.max(0, Math.round((remaining / 60) * 100));
                            progressEl.style.width = pct + '%';

                            if (remaining <= 10) {
                                badgeEl.className = 'timer-badge danger';
                                progressEl.style.background = '#C62828';
                            } else if (remaining <= 20) {
                                badgeEl.className = 'timer-badge warning';
                                progressEl.style.background = '#E65100';
                            }

                            if (remaining <= 0) {
                                clearInterval(tick);
                                timerTextEl.textContent = 'Actualizando...';
                                containerEl.classList.add('expired');
                                setTimeout(() => window.location.reload(), 800);
                            }
                        }, 1000);

                        // Poll every 5s: if connected, redirect; if new QR emitted, reload to show it
                        const pollStatus = setInterval(async () => {
                            try {
                                const r = await fetch('/health');
                                const data = await r.json();
                                if (data.whatsapp && data.whatsapp.connected) {
                                    clearInterval(pollStatus);
                                    clearInterval(tick);
                                    window.location.reload();
                                }
                            } catch (_) {}
                        }, 5000);

                        function forceNewQR() {
                            clearInterval(tick);
                            clearInterval(pollStatus);
                            timerTextEl.textContent = 'Generando...';
                            containerEl.classList.add('expired');
                            fetch('/disconnect?token=${req.query.token}', { method: 'POST' })
                                .then(() => setTimeout(() => window.location.reload(), 3000))
                                .catch(() => window.location.reload());
                        }
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

app.post('/disconnect', tokenAuth, async (req, res) => {
    try {
        await destroySession();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
