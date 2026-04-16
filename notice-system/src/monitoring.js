const { isReady, getStats, getMessageHistory, getLastQR } = require('./whatsapp');

const renderMonitoring = (backendUrl = 'http://localhost:8000') => {
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        :root {
            --primary: #818cf8;
            --primary-hover: #6366f1;
            --primary-light: rgba(99, 102, 241, 0.15);
            --success: #10b981;
            --success-light: rgba(16, 185, 129, 0.15);
            --error: #f43f5e;
            --error-light: rgba(244, 63, 94, 0.15);
            --warning: #f59e0b;
            --warning-light: rgba(245, 158, 11, 0.15);
            --text-main: #f8fafc;
            --text-secondary: #94a3b8;
            --bg-page: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.6);
            --border: rgba(255, 255, 255, 0.08);
            --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
            --backdrop: blur(12px);
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-page);
            background-image: 
                radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.1) 0px, transparent 50%);
            background-attachment: fixed;
            color: var(--text-main);
            margin: 0;
            padding: 40px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 1100px;
            position: relative;
            z-index: 1;
        }

        .card {
            background: var(--card-bg);
            backdrop-filter: var(--backdrop);
            -webkit-backdrop-filter: var(--backdrop);
            border: 1px solid var(--border);
            border-radius: 20px;
            box-shadow: var(--glass-shadow);
            padding: 32px;
            margin-bottom: 32px;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            background: var(--card-bg);
            backdrop-filter: var(--backdrop);
            padding: 20px 32px;
            border-radius: 20px;
            border: 1px solid var(--border);
            box-shadow: var(--glass-shadow);
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .header h1 .material-icons {
            -webkit-text-fill-color: initial;
            color: #818cf8;
            font-size: 36px;
            filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.5));
        }

        .status-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 24px;
            font-weight: 500;
            font-size: 14px;
            border: 1px solid transparent;
        }

        .status-connected { 
            background: var(--success-light); 
            color: var(--success); 
            border-color: rgba(16, 185, 129, 0.3);
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }
        .status-disconnected { 
            background: var(--error-light); 
            color: var(--error); 
            border-color: rgba(244, 63, 94, 0.3);
            box-shadow: 0 0 15px rgba(244, 63, 94, 0.2);
        }

        h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-main);
            margin-top: 0;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        h3 .material-icons {
            color: var(--primary);
            font-size: 24px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 16px;
        }

        .stat-item {
            text-align: center;
            padding: 24px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .stat-item:hover {
            background: rgba(255, 255, 255, 0.06);
            transform: translateY(-2px);
        }
        
        .stat-item::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, var(--primary), transparent);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .stat-item:hover::before {
            opacity: 1;
        }

        .stat-value { 
            font-size: 36px; 
            font-weight: 700; 
            display: block;
            color: var(--text-main);
            margin-bottom: 8px;
        }

        .stat-label { 
            font-size: 12px; 
            color: var(--text-secondary); 
            text-transform: uppercase; 
            letter-spacing: 1px;
            font-weight: 600;
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 32px;
            background: rgba(0, 0, 0, 0.2);
            padding: 6px;
            border-radius: 12px;
            width: fit-content;
        }

        .tab {
            padding: 10px 24px;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-secondary);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .tab.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        /* Template Cards */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
        }

        .template-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .template-card:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .template-title {
            font-weight: 600;
            font-size: 16px;
            margin: 0 0 8px 0;
            color: var(--text-main);
        }

        .template-desc {
            font-size: 13px;
            color: var(--text-secondary);
            margin: 0;
            line-height: 1.5;
        }

        .template-footer {
            margin-top: auto;
            padding-top: 16px;
            border-top: 1px dashed var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* Toggle Switch */
        .switch {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255, 255, 255, 0.1);
            transition: .4s;
            border-radius: 24px;
            border: 1px solid var(--border);
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 18px; width: 18px;
            left: 2px; bottom: 2px;
            background-color: var(--text-secondary);
            transition: .4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border-radius: 50%;
        }
        input:checked + .slider { 
            background-color: var(--primary); 
            border-color: var(--primary);
        }
        input:checked + .slider:before { 
            transform: translateX(24px); 
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .timing-input {
            width: 60px;
            padding: 6px 12px;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border);
            color: var(--text-main);
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
        }
        .timing-input:focus {
            outline: none;
            border-color: var(--primary);
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 8px;
        }
        th, td {
            text-align: left;
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }
        th { 
            color: var(--text-secondary); 
            font-weight: 600; 
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        tr { transition: background 0.2s; }
        tbody tr:hover { background: rgba(255, 255, 255, 0.02); }

        .btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-primary { 
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
            color: white; 
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .btn-primary:hover { 
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }
        .btn-outline { 
            background: transparent; 
            border: 1px solid var(--border); 
            color: var(--text-main); 
        }
        .btn-outline:hover { 
            background: rgba(255, 255, 255, 0.05); 
            border-color: rgba(255, 255, 255, 0.2);
        }

        .badge-table {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .badge-sent { background: var(--success-light); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
        .badge-failed { background: var(--error-light); color: var(--error); border: 1px solid rgba(244, 63, 94, 0.2); }
        .badge-invalid { background: var(--warning-light); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.2); }

        .qr-section {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.02);
            border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            margin-top: 24px;
            transition: border-color 0.3s;
        }
        .qr-section:hover {
            border-color: var(--primary);
        }

        .save-bar {
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 16px 32px;
            border-radius: 100px;
            display: flex;
            align-items: center;
            gap: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            z-index: 100;
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        }
        .save-bar.visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        .loading-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(4px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 5;
            border-radius: 20px;
        }
        
        .rotating { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            align-items: center; justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .modal.visible {
            opacity: 1;
        }
        .modal-content {
            background-color: var(--bg-page);
            border: 1px solid var(--border);
            box-shadow: var(--glass-shadow);
            padding: 0;
            border-radius: 20px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transform: scale(0.95);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .modal.visible .modal-content {
            transform: scale(1);
        }
        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255,255,255,0.02);
        }
        .modal-body {
            padding: 0;
            overflow-y: auto;
            background: white;
        }
        .preview-frame {
            width: 100%;
            border: none;
            background: white;
            min-height: 500px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span class="material-icons">rocket_launch</span>
                Notice System
            </h1>
            <div class="status-badge ${ready ? 'status-connected' : 'status-disconnected'}">
                <span style="width: 8px; height: 8px; border-radius:50%; background: currentColor; box-shadow: 0 0 8px currentColor;"></span>
                WhatsApp ${ready ? 'Conectado' : 'Desconectado'}
            </div>
        </div>

        <!-- System Stats -->
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3><span class="material-icons">insights</span> Estado del Sistema</h3>
                <span style="color: var(--text-secondary); font-size: 13px; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 12px;">
                    Vence el: <strong style="color:var(--text-main);">${stats.lastCheck || 'N/A'}</strong>
                </span>
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${stats.sent}</span>
                    <span class="stat-label">Enviados</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" style="color: var(--error);">${stats.failed}</span>
                    <span class="stat-label">Fallidos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" style="color: var(--warning);">${stats.invalid || 0}</span>
                    <span class="stat-label">No Registrados</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" style="color: var(--primary);">0</span>
                    <span class="stat-label">Pendientes</span>
                </div>
            </div>

            ${!ready ? `
                <div class="qr-section">
                    <span class="material-icons" style="font-size: 48px; color: var(--error); margin-bottom: 16px;">phonelink_erase</span>
                    <p style="font-size: 16px; color: var(--text-main); margin-bottom: 24px;">WhatsApp no está vinculado o ha perdido la conexión.</p>
                    <a href="/qr?token=${process.env.ADMIN_ACCESS_TOKEN || ''}" class="btn btn-primary">
                        <span class="material-icons">qr_code_scanner</span> Escanear Código QR
                    </a>
                </div>
            ` : ''}
        </div>

        <!-- Template Management -->
        <div class="card" style="position:relative;">
            <div id="templates-loading" class="loading-overlay">
                <div class="material-icons rotating" style="font-size:32px; color:var(--primary);">refresh</div>
            </div>
            
            <h3><span class="material-icons">dashboard_customize</span> Gestión de Plantillas</h3>
            
            <div class="tabs">
                <div class="tab active" onclick="switchTab('whatsapp')">WhatsApp</div>
                <div class="tab" onclick="switchTab('email')">Email</div>
            </div>

            <div id="whatsapp-templates" class="tab-content">
                <div class="template-grid" id="wa-grid">
                    <!-- WhatsApp templates will be rendered here -->
                </div>
            </div>

            <div id="email-templates" class="tab-content" style="display:none;">
                <div class="template-grid" id="email-grid">
                    <!-- Email templates will be rendered here -->
                </div>
            </div>
        </div>

        <!-- Activity History -->
        <div class="card">
            <h3><span class="material-icons">history</span> Historial Reciente</h3>
            <div style="overflow-x: auto;">
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
                                <td><div style="display:flex; align-items:center; gap:8px;">
                                    <span class="material-icons" style="font-size:16px; color:var(--text-secondary);">person</span>
                                    ${msg.recipient.split('@')[0]}
                                </div></td>
                                <td>${msg.type}</td>
                                <td>
                                    <span class="badge-table ${msg.status === 'sent' ? 'badge-sent' : msg.status === 'invalid' ? 'badge-invalid' : 'badge-failed'}">
                                        ${msg.status === 'sent' ? 'Enviado' : msg.status === 'invalid' ? 'No Registrado' : 'Fallido'}
                                    </span>
                                </td>
                                <td><span style="color:var(--text-secondary);">${msg.timestamp}</span></td>
                                <td>
                                    ${msg.status === 'failed' ? `
                                        <button onclick="resend(${index})" class="btn btn-outline" style="padding: 6px 12px; font-size:12px;">
                                            <span class="material-icons" style="font-size:14px;">refresh</span> Reintentar
                                        </button>
                                    ` : '-'}
                                </td>
                            </tr>
                        `).join('')}
                        ${history.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 48px; color: var(--text-secondary);"><span class="material-icons" style="font-size:48px; opacity:0.2; display:block; margin-bottom:16px;">inbox</span>No hay actividad reciente</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Save Bar -->
    <div id="save-bar" class="save-bar">
        <span style="display:flex; align-items:center; gap:8px; font-weight:500;">
            <span class="material-icons" style="color:var(--warning);">info</span>
            Tienes cambios sin guardar
        </span>
        <div style="display:flex; gap:12px;">
            <button class="btn btn-outline" style="color:white; border-color:rgba(255,255,255,0.2);" onclick="discardChanges()">Descartar</button>
            <button class="btn btn-primary" onclick="saveSettings()">Guardar Cambios</button>
        </div>
    </div>

    <!-- Preview Modal -->
    <div id="preview-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title" style="margin:0; font-size:18px;">Vista Previa</h3>
                <button onclick="closeModal()" class="btn btn-outline" style="min-width:auto; padding:6px; border:none; background:rgba(255,255,255,0.05);">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="modal-body">
                <div id="preview-content">
                    <iframe id="preview-iframe" class="preview-frame"></iframe>
                </div>
            </div>
        </div>
    </div>

    <script>
        const BACKEND_URL = '${backendUrl}';
        const TOKEN = new URLSearchParams(window.location.search).get('token');
        let currentSettings = null;
        let originalSettings = null;

        const TEMPLATE_INFO = {
            whatsapp: [
                { id: 'received', title: 'Nueva reserva (Admin)', desc: 'Notificación al administrador cuando entra una reserva.' },
                { id: 'confirmed', title: 'Confirmación (Cliente)', desc: 'Enviado al cliente cuando su reserva es confirmada.' },
                { id: 'cancelled', title: 'Cancelación', desc: 'Enviado al cliente si su reserva es cancelada.' },
                { id: 'reminder_2h', title: 'Recordatorio', desc: 'Recordatorio automático antes de la visita.', hasTiming: true },
                { id: 'review', title: 'Pedido de Opinión', desc: 'Solicitud de reseña después de la visita.', hasTiming: true }
            ],
            email: [
                { id: 'received', title: 'Reserva recibida', desc: 'Email informando que la solicitud fue enviada.' },
                { id: 'confirmed', title: 'Reserva confirmada', desc: 'Email con los detalles de la confirmación.' },
                { id: 'cancelled', title: 'Reserva cancelada', desc: 'Aviso de cancelación por el negocio.' },
                { id: 'reminder_2h', title: 'Recordatorio', desc: 'Recordatorio automático por email.' },
                { id: 'review', title: 'Feedback post-visita', desc: 'Email para agradecer y pedir reseña.' }
            ]
        };

        async function fetchSettings() {
            document.getElementById('templates-loading').style.display = 'flex';
            try {
                const res = await fetch(\`\${BACKEND_URL}/api/config\`);
                const data = await res.json();
                currentSettings = JSON.parse(JSON.stringify(data.notification_settings));
                originalSettings = JSON.parse(JSON.stringify(data.notification_settings));
                renderTemplates();
            } catch (err) {
                console.error('Error fetching settings:', err);
                const waGrid = document.getElementById('wa-grid');
                waGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 32px; color: var(--error);">No se pudo conectar con el backend para cargar las plantillas.</div>';
            } finally {
                document.getElementById('templates-loading').style.display = 'none';
            }
        }

        function renderTemplates() {
            if(!currentSettings) return;
            // WhatsApp Grid
            const waGrid = document.getElementById('wa-grid');
            waGrid.innerHTML = TEMPLATE_INFO.whatsapp.map(t => {
                const setting = currentSettings.whatsapp[t.id];
                const active = typeof setting === 'object' ? setting.active : setting;
                const hours = typeof setting === 'object' ? setting.hours : 2;

                return \`
                    <div class="template-card">
                        <div class="template-header">
                            <div>
                                <h4 class="template-title">\${t.title}</h4>
                                <p class="template-desc">\${t.desc}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" \${active ? 'checked' : ''} onchange="toggleStatus('whatsapp', '\${t.id}', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="template-footer">
                            <span style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; font-weight:500;">
                                <span class="material-icons" style="font-size:16px; color:#25D366;">message</span> WhatsApp
                            </span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                \${t.hasTiming ? \`
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span style="font-size:12px; color:var(--text-secondary); font-weight:500;">Horas:</span>
                                        <input type="number" class="timing-input" value="\${hours}" onchange="updateTiming('\${t.id}', this.value)">
                                    </div>
                                \` : ''}
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');

            // Email Grid
            const emailGrid = document.getElementById('email-grid');
            emailGrid.innerHTML = TEMPLATE_INFO.email.map(t => {
                const active = currentSettings.email[t.id];
                return \`
                    <div class="template-card">
                        <div class="template-header">
                            <div>
                                <h4 class="template-title">\${t.title}</h4>
                                <p class="template-desc">\${t.desc}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" \${active ? 'checked' : ''} onchange="toggleStatus('email', '\${t.id}', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="template-footer">
                            <span style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; font-weight:500;">
                                <span class="material-icons" style="font-size:16px; color:#EA4335;">mail</span> Email
                            </span>
                            <button class="btn btn-outline" style="padding:6px 12px; font-size:12px;" onclick="previewEmail('\${t.id}')">
                                <span class="material-icons" style="font-size:14px;">visibility</span> Vista Previa
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function switchTab(type) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            
            document.getElementById('whatsapp-templates').style.display = type === 'whatsapp' ? 'block' : 'none';
            document.getElementById('email-templates').style.display = type === 'email' ? 'block' : 'none';
        }

        function toggleStatus(channel, id, status) {
            if (channel === 'whatsapp' && (id === 'reminder_2h' || id === 'review')) {
                currentSettings[channel][id].active = status;
            } else {
                currentSettings[channel][id] = status;
            }
            checkForChanges();
        }

        function updateTiming(id, hours) {
            currentSettings.whatsapp[id].hours = parseInt(hours);
            checkForChanges();
        }

        function checkForChanges() {
            const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
            const saveBar = document.getElementById('save-bar');
            if (hasChanges) {
                saveBar.classList.add('visible');
            } else {
                saveBar.classList.remove('visible');
            }
        }

        function discardChanges() {
            currentSettings = JSON.parse(JSON.stringify(originalSettings));
            renderTemplates();
            checkForChanges();
        }

        async function saveSettings() {
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-icons rotating" style="font-size:16px;">autorenew</span> Guardando...';
            
            try {
                const res = await fetch(\`\${BACKEND_URL}/api/admin/config\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification_settings: currentSettings })
                });
                
                if (res.ok) {
                    originalSettings = JSON.parse(JSON.stringify(currentSettings));
                    checkForChanges();
                    
                    // Show success temporary state
                    btn.innerHTML = '<span class="material-icons" style="font-size:16px;">check</span> Guardado';
                    btn.style.background = 'var(--success)';
                    setTimeout(() => {
                        btn.style.background = '';
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 2000);
                } else {
                    alert('Error al guardar la configuración.');
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }
            } catch (err) {
                alert('Error de conexión con el backend.');
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }

        async function previewEmail(type) {
            const modal = document.getElementById('preview-modal');
            document.getElementById('modal-title').innerText = 'Vista Previa: ' + type;
            modal.style.display = 'flex';
            // Trigger reflow for animation
            void modal.offsetWidth;
            modal.classList.add('visible');
            
            const iframe = document.getElementById('preview-iframe');
            iframe.srcdoc = '<div style="display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; color:#666;">Cargando vista previa...</div>';
            
            try {
                const res = await fetch(\`\${BACKEND_URL}/api/admin/templates/preview/\${type}\`);
                const html = await res.text();
                iframe.srcdoc = html;
            } catch (err) {
                iframe.srcdoc = '<div style="display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; color:#ea4335;">Error al cargar vista previa.</div>';
            }
        }

        function closeModal() {
            const modal = document.getElementById('preview-modal');
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }

        async function resend(index) {
            try {
                const res = await fetch('/resend?token=' + TOKEN, {
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

        // Initialize
        fetchSettings();
        
        // Auto refresh history every 60s (unless there are unsaved changes)
        setInterval(() => {
            if (!document.getElementById('save-bar').classList.contains('visible')) {
                window.location.reload();
            }
        }, 60000);
    </script>
</body>
</html>
    `;
};

module.exports = { renderMonitoring };
