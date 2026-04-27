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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        :root {
            --primary: #1a73e8;
            --primary-dark: #1557b0;
            --primary-light: #E8F0FE;
            --accent: #1a73e8;

            --background: #F5F5F5;
            --surface: #FFFFFF;
            --error: #D32F2F;
            --success: #388E3C;
            --warning: #F57C00;
            --text-primary: rgba(0, 0, 0, 0.87);
            --text-secondary: rgba(0, 0, 0, 0.60);
            --text-disabled: rgba(0, 0, 0, 0.38);
            --border: rgba(0, 0, 0, 0.12);
            
            /* MD2 Elevation 2 */
            --shadow-elevation-2: 0px 3px 1px -2px rgba(0,0,0,0.2), 
                                 0px 2px 2px 0px rgba(0,0,0,0.14), 
                                 0px 1px 5px 0px rgba(0,0,0,0.12);
            
            /* MD2 Elevation 4 */
            --shadow-elevation-4: 0px 2px 4px -1px rgba(0,0,0,0.2), 
                                 0px 4px 5px 0px rgba(0,0,0,0.14), 
                                 0px 1px 10px 0px rgba(0,0,0,0.12);
        }

        body {
            font-family: 'Inter', 'Roboto', sans-serif;
            background-color: var(--background);
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }

        .header {
            background-color: var(--surface);
            color: var(--text-primary);
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px;
            box-shadow: var(--shadow-elevation-2);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            letter-spacing: 0.25px;
        }

        .header h1 .material-icons {
            color: var(--primary);
            font-size: 24px;
        }

        .container {
            max-width: 1100px;
            margin: 32px auto;
            padding: 0 24px;
        }

        .card {
            background: var(--surface);
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: var(--shadow-elevation-2);
            border: 1px solid var(--border);
        }

        h3 {
            margin: 0 0 24px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        h3 .material-icons {
            color: var(--text-secondary);
            font-size: 22px;
        }

        /* Stat Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 8px;
        }

        .stat-item {
            background: var(--surface);
            border-radius: 8px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            border: 1px solid var(--border);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-item:hover {
            box-shadow: var(--shadow-elevation-4);
            transform: translateY(-2px);
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-light);
            color: var(--primary);
        }


        .stat-content {
            display: flex;
            flex-direction: column;
        }

        .stat-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
        }

        /* Tabs */
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border);
            margin-bottom: 24px;
        }

        .tab {
            padding: 12px 24px;
            cursor: pointer;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.75px;
            position: relative;
            transition: color 0.2s;
        }

        .tab:hover {
            color: var(--primary-dark);
            background: rgba(255, 179, 0, 0.04);
        }

        .tab.active {
            color: var(--primary-dark);
        }

        .tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--primary);
            border-radius: 3px 3px 0 0;
        }

        /* Template Cards */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }

        .template-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            transition: all 0.2s;
        }

        .template-card:hover {
            box-shadow: var(--shadow-elevation-4);
            border-color: var(--primary-light);
        }

        .template-title {
            font-weight: 600;
            font-size: 16px;
            color: var(--text-primary);
            margin: 0 0 8px 0;
        }

        .template-desc {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0;
            flex-grow: 1;
        }

        /* Buttons */
        .btn {
            height: 36px;
            padding: 0 16px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.75px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            transition: all 0.2s;
        }

        .btn-primary {
            background-color: var(--primary);
            color: rgba(0,0,0,0.87);
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }

        .btn-primary:hover {
            background-color: var(--primary-dark);
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-secondary);
        }

        .btn-outline:hover {
            background: rgba(0,0,0,0.04);
            border-color: var(--text-primary);
            color: var(--text-primary);
        }

        /* Badges */
        .status-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }

        .status-connected {
            background: #E8F5E9;
            color: #2E7D32;
        }

        .status-disconnected {
            background: #FFEBEE;
            color: #C62828;
        }

        .badge-table {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .badge-sent { background: #E8F5E9; color: #2E7D32; }
        .badge-failed { background: #FFEBEE; color: #C62828; }
        .badge-invalid { background: #F5F5F5; color: #757575; }

        /* Switches & Controls */
        .switch {
            position: relative;
            display: inline-block;
            width: 36px;
            height: 20px;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #BDBDBD;
            transition: .3s;
            border-radius: 20px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 14px; width: 14px;
            left: 3px; bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(16px); }

        .timing-input {
            width: 50px;
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 4px 8px;
            font-family: inherit;
            font-weight: 600;
            text-align: center;
            outline: none;
        }

        .timing-input:focus {
            border-color: var(--primary);
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 16px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-secondary);
            border-bottom: 2px solid var(--border);
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        tr:hover td {
            background-color: rgba(0,0,0,0.02);
        }

        /* Save Bar */
        .save-bar {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #323232;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 24px;
            box-shadow: var(--shadow-elevation-4);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 2000;
        }

        .save-bar.visible { transform: translateX(-50%) translateY(0); }

        /* Modal */
        .modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 24px;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .modal.visible { opacity: 1; }

        .modal-content {
            background: var(--surface);
            border-radius: 8px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-elevation-4);
        }

        .modal-header {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #F5F5F5;
        }

        .modal-body {
            flex-grow: 1;
            overflow-y: auto;
            background: #F5F5F5;
            display: flex;
            flex-direction: column;
        }

        #preview-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .preview-frame {
            width: 100%;
            flex-grow: 1;
            min-height: 600px;
            border: none;
            background: white;
            display: block;
        }


        .whatsapp-preview-container {
            background: #e5ddd5;
            background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
            padding: 40px 24px;
            min-height: 400px;
            display: flex;
            flex-direction: column;
        }

        .wa-bubble {
            background: white;
            padding: 12px 16px;
            border-radius: 0 12px 12px 12px;
            max-width: 85%;
            box-shadow: 0 1px 1px rgba(0,0,0,0.1);
            position: relative;
            font-size: 14.5px;
            line-height: 1.4;
        }

        .wa-bubble::before {
            content: "";
            position: absolute;
            left: -10px;
            top: 0;
            width: 0; height: 0;
            border-style: solid;
            border-width: 0 10px 10px 0;
            border-color: transparent white transparent transparent;
        }

        .wa-time {
            font-size: 11px;
            color: #999;
            display: block;
            text-align: right;
            margin-top: 4px;
        }

        .rotating { animation: rot 1s infinite linear; }
        @keyframes rot { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            <span class="material-icons">notifications_active</span>
            Notice System
        </h1>
        <div class="status-badge ${ready ? 'status-connected' : 'status-disconnected'}">
            <span class="material-icons" style="font-size: 16px;">${ready ? 'check_circle' : 'error'}</span>
            ${ready ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
        </div>
    </div>

    <div class="container">
        <!-- System Overview -->
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                <h3><span class="material-icons">dashboard</span> Panel de Control</h3>
                <span style="color: var(--text-secondary); font-size: 13px; font-weight: 500;">
                    Última sincronización: <strong style="color: var(--text-primary);">${stats.lastCheck || 'Nunca'}</strong>
                </span>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-icon"><span class="material-icons">send</span></div>
                    <div class="stat-content">
                        <span class="stat-label">Enviados</span>
                        <span class="stat-value">${stats.sent}</span>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon" style="background:#FFEBEE; color:#C62828;"><span class="material-icons">error_outline</span></div>
                    <div class="stat-content">
                        <span class="stat-label">Fallidos</span>
                        <span class="stat-value">${stats.failed}</span>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon" style="background:#FFF3E0; color:#EF6C00;"><span class="material-icons">person_off</span></div>
                    <div class="stat-content">
                        <span class="stat-label">No Registrados</span>
                        <span class="stat-value">${stats.invalid || 0}</span>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon" style="background:#E3F2FD; color:#1565C0;"><span class="material-icons">schedule</span></div>
                    <div class="stat-content">
                        <span class="stat-label">Uptime</span>
                        <span class="stat-value">100%</span>
                    </div>
                </div>
            </div>

            ${!ready ? `
                <div style="margin-top: 32px; padding: 24px; background: #E8F0FE; border-radius: 8px; border: 1px solid #1a73e8; text-align: center;">
                    <span class="material-icons" style="font-size: 48px; color: #1a73e8; margin-bottom: 16px;">qr_code_2</span>
                    <h4 style="margin: 0 0 8px 0; color: #1557b0;">Acción Requerida</h4>
                    <p style="color: #1a73e8; margin-bottom: 24px;">La sesión de WhatsApp ha expirado o no ha sido vinculada todavía.</p>
                    <a href="/qr?token=${process.env.ADMIN_ACCESS_TOKEN || ''}" class="btn btn-primary" style="background: #1a73e8; color: white;">
                        <span class="material-icons">link</span> Vincular Ahora
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
                                <td><div style="display:flex; align-items:center; gap:12px;">
                                    <span class="material-icons" style="font-size:18px; color:var(--text-medium);">person</span>
                                    <span style="color:var(--text-high);">${msg.recipient.split('@')[0]}</span>
                                </div></td>
                                <td style="color:var(--text-medium);">${msg.type}</td>
                                <td>
                                    <span class="badge-table ${msg.status === 'sent' ? 'badge-sent' : msg.status === 'invalid' ? 'badge-invalid' : 'badge-failed'}">
                                        ${msg.status === 'sent' ? 'Enviado' : msg.status === 'invalid' ? 'No Registrado' : 'Fallido'}
                                    </span>
                                </td>
                                <td><span style="color:var(--text-medium);">${msg.timestamp}</span></td>
                                <td>
                                    ${msg.status === 'failed' ? `
                                        <button onclick="resend(${index})" class="btn btn-outline" style="height: 28px; font-size:11px; padding: 0 8px;">
                                            <span class="material-icons" style="font-size:14px;">refresh</span> Reintentar
                                        </button>
                                    ` : '-'}
                                </td>
                            </tr>
                        `).join('')}
                        ${history.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 64px; color: var(--text-disabled);"><span class="material-icons" style="font-size:48px; opacity:0.2; display:block; margin-bottom:16px;">inbox</span>No hay actividad reciente</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Save Bar (Snackbar Style) -->
    <div id="save-bar" class="save-bar">
        <span style="display:flex; align-items:center; gap:12px; font-size: 14px; color: rgba(255,255,255,0.87);">
            Tienes cambios sin guardar
        </span>
        <div style="display:flex; gap:12px;">
            <button class="btn" style="color:var(--primary); background:transparent; padding: 0 8px;" onclick="discardChanges()">Descartar</button>
            <button class="btn" style="color:var(--primary); background:transparent; padding: 0 8px; font-weight: 700;" onclick="saveSettings()">Guardar</button>
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
            <div class="modal-body" id="preview-body">
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
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div style="flex:1;">
                                <h4 class="template-title">\${t.title}</h4>
                                <p class="template-desc">\${t.desc}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" \${active ? 'checked' : ''} onchange="toggleStatus('whatsapp', '\${t.id}', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="margin-top:auto; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; gap: 8px;">
                            <span style="font-size:12px; color:var(--text-medium); display:flex; align-items:center; gap:8px; font-weight:500;">
                                <span class="material-icons" style="font-size:16px; color:#25D366;">message</span> WhatsApp
                            </span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <button class="btn btn-outline" style="height: 28px; font-size:11px; padding: 0 8px;" onclick="previewWhatsApp('\${t.id}')">
                                    <span class="material-icons" style="font-size:14px;">visibility</span> VISTA PREVIA
                                </button>
                                \${t.hasTiming ? \`
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span style="font-size:11px; color:var(--text-medium);">HORAS:</span>
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
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div style="flex:1;">
                                <h4 class="template-title">\${t.title}</h4>
                                <p class="template-desc">\${t.desc}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" \${active ? 'checked' : ''} onchange="toggleStatus('email', '\${t.id}', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="margin-top:auto; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:12px; color:var(--text-medium); display:flex; align-items:center; gap:8px; font-weight:500;">
                                <span class="material-icons" style="font-size:16px; color:#EA4335;">mail</span> EMAIL
                            </span>
                            <button class="btn btn-outline" style="height: 28px; font-size:11px; padding: 0 8px;" onclick="previewEmail('\${t.id}')">
                                <span class="material-icons" style="font-size:14px;">visibility</span> VISTA PREVIA
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
            document.getElementById('modal-title').innerText = 'Vista Previa Email: ' + type;
            modal.style.display = 'flex';
            void modal.offsetWidth;
            modal.classList.add('visible');
            
            const content = document.getElementById('preview-content');
            content.innerHTML = '<iframe id="preview-iframe" class="preview-frame"></iframe>';
            const iframe = document.getElementById('preview-iframe');
            iframe.srcdoc = '<div style="display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; color:#666;">Cargando vista previa...</div>';
            
            try {
                const res = await fetch(\`\${BACKEND_URL}/api/admin/templates/preview/email/\${type}\`);
                const html = await res.text();
                iframe.srcdoc = html;
            } catch (err) {
                iframe.srcdoc = '<div style="display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; color:#ea4335;">Error al cargar vista previa.</div>';
            }
        }

        async function previewWhatsApp(type) {
            const modal = document.getElementById('preview-modal');
            document.getElementById('modal-title').innerText = 'Vista Previa WhatsApp: ' + type;
            modal.style.display = 'flex';
            void modal.offsetWidth;
            modal.classList.add('visible');
            
            const content = document.getElementById('preview-content');
            content.innerHTML = '<div class="whatsapp-preview-container"><div style="display:flex; align-items:center; justify-content:center; height:100%; width:100%; color:#555;">Cargando...</div></div>';
            
            try {
                const res = await fetch(\`\${BACKEND_URL}/api/admin/templates/preview/whatsapp/\${type}\`);
                const data = await res.json();
                
                const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                content.innerHTML = \`
                    <div class="whatsapp-preview-container">
                        <div class="wa-bubble">
                            \${data.message.replace(/\\n/g, '<br>')}
                            <span class="wa-time">\${timeStr}</span>
                        </div>
                    </div>
                \`;
            } catch (err) {
                content.innerHTML = '<div class="whatsapp-preview-container"><div style="display:flex; align-items:center; justify-content:center; height:100%; width:100%; color:var(--error);">Error al cargar vista previa.</div></div>';
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
