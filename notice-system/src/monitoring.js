const { isReady, getStats, getMessageHistory, getLastQR } = require('./whatsapp');

const renderMonitoring = () => {
    const ready = isReady();
    const stats = getStats();
    const history = getMessageHistory();
    const qr = getLastQR();

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoreo - Notice System</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #1a73e8;
            --success: #34a853;
            --error: #ea4335;
            --warning: #fbbc04;
            --text-main: #202124;
            --text-secondary: #5f6368;
            --bg-page: #f8f9fa;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background-color: var(--bg-page);
            color: var(--text-main);
            margin: 0;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .container {
            width: 100%;
            max-width: 900px;
        }
        .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            padding: 24px;
            margin-bottom: 24px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }
        .status-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 16px;
            font-weight: 500;
            font-size: 14px;
        }
        .status-connected { background: #e6f4ea; color: var(--success); }
        .status-disconnected { background: #fce8e6; color: var(--error); }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 32px;
        }
        .stat-item {
            text-align: center;
            padding: 16px;
            border-radius: 8px;
            background: #f1f3f4;
        }
        .stat-value { font-size: 24px; font-weight: 700; display: block; }
        .stat-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
        }
        th { color: var(--text-secondary); font-weight: 500; }
        
        .btn {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            transition: background 0.2s;
        }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: #1765cc; }
        .btn-outline { background: transparent; border: 1px solid #dadce0; color: var(--primary); }
        .btn-outline:hover { background: #f1f3f4; }
        
        .badge-table {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
        }
        .badge-sent { background: #e6f4ea; color: var(--success); }
        .badge-failed { background: #fce8e6; color: var(--error); }
        .badge-invalid { background: #fef7e0; color: var(--warning); }

        .qr-section {
            text-align: center;
            padding: 24px;
            border: 2px dashed #dadce0;
            border-radius: 8px;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Panel de Control</h1>
            <div class="status-badge ${ready ? 'status-connected' : 'status-disconnected'}">
                <span style="width: 8px; height: 8px; border-radius:50%; background: currentColor;"></span>
                WhatsApp ${ready ? 'Conectado' : 'Desconectado'}
            </div>
        </div>

        <div class="card">
            <p style="margin-top:0; color: var(--text-secondary); font-size: 13px;">
                Última verificación del estado: <strong>${stats.lastCheck}</strong>
            </p>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${stats.sent}</span>
                    <span class="stat-label">Enviados</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.failed}</span>
                    <span class="stat-label">Fallidos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.invalid || 0}</span>
                    <span class="stat-label">No Registrados</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">0</span>
                    <span class="stat-label">Pendientes</span>
                </div>
            </div>

            ${!ready ? `
                <div class="qr-section">
                    <p>WhatsApp no está vinculado o ha perdido la conexión.</p>
                    <a href="/qr?token=${process.env.ADMIN_ACCESS_TOKEN}" class="btn btn-primary">Escanear Código QR</a>
                </div>
            ` : ''}
        </div>

        <div class="card">
            <h3>Últimos 10 Mensajes</h3>
            <table>
                <thead>
                    <tr>
                        <th>Destinatario</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Fecha/Hora</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map((msg, index) => `
                        <tr>
                            <td>${msg.recipient.split('@')[0]}</td>
                            <td>${msg.type}</td>
                            <td>
                                <span class="badge-table ${msg.status === 'sent' ? 'badge-sent' : msg.status === 'invalid' ? 'badge-invalid' : 'badge-failed'}">
                                    ${msg.status === 'sent' ? 'Enviado' : msg.status === 'invalid' ? 'No Registrado' : 'Fallido'}
                                </span>
                            </td>
                            <td>${msg.timestamp}</td>
                            <td>
                                ${msg.status === 'failed' ? `
                                    <button onclick="resend(${index})" class="btn btn-outline" style="padding: 4px 8px;">Reintentar</button>
                                ` : '-'}
                            </td>
                        </tr>
                    `).join('')}
                    ${history.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 32px; color: var(--text-secondary);">No hay actividad reciente</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        async function resend(index) {
            const token = new URLSearchParams(window.location.search).get('token');
            try {
                const res = await fetch('/resend?token=' + token, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ index })
                });
                if (res.ok) window.location.reload();
                else alert('Error al reintentar el mensaje');
            } catch (err) {
                alert('Error de conexión');
            }
        }
        
        // Auto refresh every 30s
        setTimeout(() => window.location.reload(), 30000);
    </script>
</body>
</html>
    `;
};

module.exports = { renderMonitoring };
