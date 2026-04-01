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
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        :root {
            --primary: #1a73e8;
            --primary-light: #e8f0fe;
            --success: #34a853;
            --error: #ea4335;
            --warning: #fbbc04;
            --text-main: #202124;
            --text-secondary: #5f6368;
            --bg-page: #f8f9fa;
            --border: #dadce0;
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
            max-width: 1000px;
        }
        .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
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
            margin-bottom: 16px;
        }
        .stat-item {
            text-align: center;
            padding: 16px;
            border-radius: 8px;
            background: #f1f3f4;
        }
        .stat-value { font-size: 24px; font-weight: 700; display: block; }
        .stat-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; }

        /* Tabs */
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border);
            margin-bottom: 24px;
        }
        .tab {
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-secondary);
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }
        .tab.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
        }

        /* Template Cards */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .template-card {
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: box-shadow 0.2s;
        }
        .template-card:hover {
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .template-title {
            font-weight: 500;
            font-size: 16px;
            margin: 0;
        }
        .template-desc {
            font-size: 13px;
            color: var(--text-secondary);
            margin: 0;
        }
        .template-footer {
            margin-top: auto;
            padding-top: 12px;
            border-top: 1px dashed var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* Toggle Switch */
        .switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 20px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 14px; width: 14px;
            left: 3px; bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--success); }
        input:checked + .slider:before { transform: translateX(20px); }

        .timing-input {
            width: 60px;
            padding: 4px 8px;
            border: 1px solid var(--border);
            border-radius: 4px;
            font-size: 13px;
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.5);
            align-items: center; justify-content: center;
        }
        .modal-content {
            background-color: white;
            padding: 0;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .modal-header {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-body {
            padding: 24px;
            overflow-y: auto;
            background: #f1f3f4;
        }
        .preview-frame {
            width: 100%;
            border: none;
            background: white;
            border-radius: 4px;
            min-height: 400px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid var(--border);
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
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: #1765cc; }
        .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--primary); }
        .btn-outline:hover { background: var(--primary-light); }
        
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
            border: 2px dashed var(--border);
            border-radius: 8px;
            margin-top: 16px;
        }

        .save-bar {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #202124;
            color: white;
            padding: 12px 24px;
            border-radius: 32px;
            display: none;
            align-items: center;
            gap: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 100;
        }

        .loading-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255,255,255,0.7);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 5;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="display:flex; align-items:center; gap:12px;">
                <span class="material-icons" style="color:var(--primary); font-size:32px;">notifications_active</span>
                Notice System
            </h1>
            <div class="status-badge ${ready ? 'status-connected' : 'status-disconnected'}">
                <span style="width: 8px; height: 8px; border-radius:50%; background: currentColor;"></span>
                WhatsApp ${ready ? 'Conectado' : 'Desconectado'}
            </div>
        </div>

        <!-- System Stats -->
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0;">Estado del Sistema</h3>
                <span style="color: var(--text-secondary); font-size: 13px;">
                    Vence el: <strong>${stats.lastCheck}</strong>
                </span>
            </div>
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
                    <a href="/qr?token=${process.env.ADMIN_ACCESS_TOKEN}" class="btn btn-primary">
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
            
            <h3 style="margin-top:0; margin-bottom:24px;">Gestión de Plantillas</h3>
            
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
            <h3 style="margin-top:0;">Historial Reciente</h3>
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

    <!-- Save Bar -->
    <div id="save-bar" class="save-bar">
        <span>Tienes cambios sin guardar</span>
        <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" style="color:white; border-color:#5f6368;" onclick="discardChanges()">Descartar</button>
            <button class="btn btn-primary" onclick="saveSettings()">Guardar Cambios</button>
        </div>
    </div>

    <!-- Preview Modal -->
    <div id="preview-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title" style="margin:0;">Vista Previa</h3>
                <button onclick="closeModal()" class="btn btn-outline" style="min-width:auto; padding:4px;"><span class="material-icons">close</span></button>
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
                alert('No se pudo conectar con el backend para cargar las plantillas.');
            } finally {
                document.getElementById('templates-loading').style.display = 'none';
            }
        }

        function renderTemplates() {
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
                            <span style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;">
                                <span class="material-icons" style="font-size:16px;">whatsapp</span> WhatsApp
                            </span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                \${t.hasTiming ? \`
                                    <div style="display:flex; align-items:center; gap:4px;">
                                        <span style="font-size:11px; color:var(--text-secondary);">Horas:</span>
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
                            <span style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;">
                                <span class="material-icons" style="font-size:16px;">mail_outline</span> Email
                            </span>
                            <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="previewEmail('\${t.id}')">
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
            document.getElementById('save-bar').style.display = hasChanges ? 'flex' : 'none';
        }

        function discardChanges() {
            currentSettings = JSON.parse(JSON.stringify(originalSettings));
            renderTemplates();
            checkForChanges();
        }

        async function saveSettings() {
            const btn = event.target;
            btn.disabled = true;
            btn.innerText = 'Guardando...';
            
            try {
                const res = await fetch(\`\${BACKEND_URL}/api/admin/config\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notification_settings: currentSettings })
                });
                
                if (res.ok) {
                    originalSettings = JSON.parse(JSON.stringify(currentSettings));
                    checkForChanges();
                    alert('Configuración guardada exitosamente.');
                } else {
                    alert('Error al guardar la configuración.');
                }
            } catch (err) {
                alert('Error de conexión con el backend.');
            } finally {
                btn.disabled = false;
                btn.innerText = 'Guardar Cambios';
            }
        }

        async function previewEmail(type) {
            document.getElementById('modal-title').innerText = 'Vista Previa: ' + type;
            document.getElementById('preview-modal').style.display = 'flex';
            const iframe = document.getElementById('preview-iframe');
            iframe.srcdoc = '<p style="padding:20px; font-family:sans-serif;">Cargando vista previa...</p>';
            
            try {
                const res = await fetch(\`\${BACKEND_URL}/api/admin/templates/preview/\${type}\`);
                const html = await res.text();
                iframe.srcdoc = html;
            } catch (err) {
                iframe.srcdoc = '<p style="padding:20px; color:red; font-family:sans-serif;">Error al cargar vista previa.</p>';
            }
        }

        function closeModal() {
            document.getElementById('preview-modal').style.display = 'none';
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
            if (document.getElementById('save-bar').style.display !== 'flex') {
                window.location.reload();
            }
        }, 60000);
    </script>
</body>
</html>
    `;
};

module.exports = { renderMonitoring };
