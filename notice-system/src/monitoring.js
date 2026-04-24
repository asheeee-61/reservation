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
            --primary: #1a73e8;
            --primary-hover: #185abc;
            --primary-on: #ffffff;
            --surface: #ffffff;
            --background: #f1f3f4;
            --error: #d93025;
            --success: #1e8e3e;
            --text-primary: #202124;
            --text-secondary: #5f6368;
            --border: #dadce0;
            
            /* MD2 Elevation Shadows */
            --shadow-1: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
            --shadow-2: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
            --shadow-3: 0 4px 4px 0 rgba(60,64,67,0.3), 0 8px 12px 6px rgba(60,64,67,0.15);
        }

        body {
            font-family: 'Roboto', 'Inter', -apple-system, sans-serif;
            background-color: var(--background);
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        /* Header App Bar */
        .header {
            background-color: var(--surface);
            color: var(--text-primary);
            padding: 8px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px;
            box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 400;
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-primary);
        }

        .header h1 .material-icons {
            color: var(--primary);
            font-size: 24px;
        }

        .container {
            max-width: 1200px;
            margin: 24px auto;
            padding: 0 24px;
            width: 100%;
            box-sizing: border-box;
        }

        /* Cards */
        .card {
            background: var(--surface);
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: var(--shadow-1);
            transition: box-shadow 0.2s ease;
        }

        .card:hover {
            box-shadow: var(--shadow-2);
        }

        .card h3 {
            margin: 0 0 20px 0;
            font-size: 18px;
            font-weight: 500;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .stat-card {
            background: var(--surface);
            padding: 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-1);
            position: relative;
            overflow: hidden;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
        }

        .stat-value {
            font-size: 36px;
            font-weight: 300;
            color: var(--primary);
        }

        /* Tabs */
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--border);
            margin-bottom: 24px;
            gap: 8px;
        }

        .tab {
            padding: 12px 24px;
            cursor: pointer;
            color: var(--text-secondary);
            font-weight: 500;
            font-size: 14px;
            text-transform: none;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 4px 4px 0 0;
        }

        .tab:hover {
            background: rgba(26, 115, 232, 0.04);
            color: var(--primary);
        }

        .tab.active {
            color: var(--primary);
            border-bottom: 2px solid var(--primary);
        }

        /* Template Grid */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
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
            box-shadow: var(--shadow-2);
            border-color: transparent;
        }

        .template-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }

        .template-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--text-primary);
        }

        /* Timing Controls */
        .timing-control {
            background: #f8f9fa;
            border-radius: 4px;
            padding: 4px 8px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            border: 1px solid var(--border);
        }

        .timing-input {
            width: 40px;
            border: none;
            background: transparent;
            font-weight: 500;
            color: var(--primary);
            text-align: center;
            outline: none;
        }

        /* MD2 Controls */
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
            top: 2px; left: 0; right: 0; bottom: 2px;
            background-color: #9aa0a6;
            transition: .4s;
            border-radius: 20px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 20px; width: 20px;
            left: -2px; bottom: -2px;
            background-color: #ffffff;
            transition: .4s;
            border-radius: 50%;
            box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
        }

        input:checked + .slider { background-color: rgba(26, 115, 232, 0.5); }
        input:checked + .slider:before { 
            background-color: var(--primary);
            transform: translateX(20px); 
        }

        /* Table */
        .table-container {
            overflow-x: auto;
            border: 1px solid var(--border);
            border-radius: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 12px 16px;
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            background: #f8f9fa;
            border-bottom: 1px solid var(--border);
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        tr:last-child td { border-bottom: none; }
        tbody tr:hover { background-color: #f8f9fa; }

        /* Buttons */
        .btn {
            border-radius: 4px;
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px 16px;
            height: 36px;
            text-transform: uppercase;
            letter-spacing: 0.25px;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
            box-shadow: var(--shadow-1);
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
            box-shadow: var(--shadow-2);
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--primary);
        }

        .btn-outline:hover {
            background: rgba(26, 115, 232, 0.04);
            border-color: var(--primary);
        }

        /* Badges */
        .badge {
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
        }

        .badge-online { background: #e6f4ea; color: #1e8e3e; }
        .badge-offline { background: #fce8e6; color: #d93025; }

        .badge-msg {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
        }
        .badge-sent { background: #e6f4ea; color: #1e8e3e; }
        .badge-failed { background: #fce8e6; color: #d93025; }

        /* Save Bar (Snackbar) */
        .save-bar {
            position: fixed;
            bottom: 24px;
            left: 24px;
            right: 24px;
            max-width: 400px;
            margin: 0 auto;
            background: #323336;
            color: #ffffff;
            padding: 14px 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: var(--shadow-3);
            transform: translateY(100px);
            transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1);
            z-index: 2000;
        }

        .save-bar.visible { transform: translateY(0); }

        /* Modal (MD2 Dialog) */
        .modal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(32, 33, 36, 0.6);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            padding: 24px;
            backdrop-filter: blur(2px);
        }

        .modal-content {
            background: #ffffff;
            border-radius: 8px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-3);
        }

        .modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-body {
            flex-grow: 1;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .preview-frame {
            width: 100%;
            border: none;
            background: white;
            min-height: 500px;
            display: block;
        }

        .status-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 12px;
            border-radius: 16px;
            font-weight: 500;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-connected { 
            background: rgba(3, 218, 198, 0.12); 
            color: var(--secondary); 
        }
        .status-disconnected { 
            background: rgba(207, 102, 121, 0.12); 
            color: var(--error); 
        }

        h3 {
            font-size: 18px;
            font-weight: 500;
            color: var(--text-high);
            margin-top: 0;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            letter-spacing: 0.25px;
        }
        
        h3 .material-icons {
            color: var(--primary);
            font-size: 24px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 8px;
        }

        .stat-item {
            text-align: left;
            padding: 16px;
            border-radius: 8px;
            background: var(--surface-elevated);
            box-shadow: var(--shadow-1);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.03);
        }
        
        .stat-item:hover {
            box-shadow: var(--shadow-2);
        }

        .stat-value { 
            font-size: 32px; 
            font-weight: 400; 
            display: block;
            color: var(--text-high);
            line-height: 1.2;
        }

        .stat-label { 
            font-size: 12px; 
            color: var(--text-medium); 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            font-weight: 500;
            margin-top: 4px;
            display: block;
        }

        .tabs {
            display: flex;
            gap: 0;
            margin-bottom: 24px;
            border-bottom: 1px solid rgba(255,255,255,0.12);
            width: 100%;
        }

        .tab {
            padding: 12px 24px;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-medium);
            transition: all 0.2s ease;
            position: relative;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 1.25px;
        }

        .tab:hover {
            color: var(--text-high);
            background: rgba(255,255,255,0.04);
        }

        .tab.active {
            color: var(--primary);
        }

        .tab.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--primary);
        }

        /* Template Cards */
        .template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .template-card {
            background: var(--surface-elevated);
            border-radius: 8px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            border: 1px solid rgba(255,255,255,0.05);
            box-shadow: var(--shadow-1);
        }

        .template-card:hover {
            box-shadow: var(--shadow-2);
        }

        .template-title {
            font-weight: 500;
            font-size: 16px;
            margin: 0;
            color: var(--text-high);
        }

        .template-desc {
            font-size: 14px;
            color: var(--text-medium);
            margin: 0 0 20px 0;
            flex-grow: 1;
        }

        /* MD2 Controls */
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
            background-color: rgba(0,0,0,0.26);
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
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }

        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(16px); }

        .timing-input {
            width: 60px;
            background: #f1f3f4;
            border: 1px solid var(--border);
            color: var(--text-high);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 13px;
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        th {
            text-align: left;
            padding: 12px 16px;
            color: var(--text-medium);
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            border-bottom: 1px solid var(--border);
        }

        td {
            padding: 16px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        tr:hover td {
            background-color: #f8f9fa;
        }

        /* Buttons */
        .btn {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            text-transform: uppercase;
            letter-spacing: 1.25px;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
            box-shadow: var(--shadow-1);
        }

        .btn-primary:hover {
            background-color: var(--primary-variant);
            box-shadow: var(--shadow-2);
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--primary);
        }

        .btn-outline:hover {
            background: rgba(26, 115, 232, 0.04);
            border-color: var(--primary);
        }

        /* Status badges */
        .badge {
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 12px;
            font-weight: 500;
        }

        .badge-online { background: #e6f4ea; color: #1e8e3e; }
        .badge-offline { background: #fce8e6; color: #d93025; }

        .badge-table {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-sent { background: #e6f4ea; color: #1e8e3e; }
        .badge-failed { background: #fce8e6; color: #d93025; }
        .badge-invalid { background: #f1f3f4; color: #5f6368; }

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
            gap: 32px;
            box-shadow: var(--shadow-3);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
        }

        .save-bar.visible { transform: translateX(-50%) translateY(0); }

        /* Modal */
        .modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.50);
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
            box-shadow: var(--shadow-3);
        }

        .modal-header {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8f9fa;
        }

        .modal-body {
            flex-grow: 1;
            overflow-y: auto;
            position: relative;
            background: #f1f3f4;
        }

        .preview-frame {
            width: 100%;
            border: none;
            background: white;
            min-height: 500px;
            display: block;
        }

        .whatsapp-preview-container {
            background: #e5ddd5;
            background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
            padding: 40px 20px;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .wa-bubble {
            background: white;
            padding: 12px 16px;
            border-radius: 0 12px 12px 12px;
            max-width: 85%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            position: relative;
            white-space: pre-wrap;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14.5px;
            color: #111;
            line-height: 1.4;
        }

        .wa-bubble::before {
            content: "";
            position: absolute;
            left: -10px;
            top: 0;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 10px 10px 0;
            border-color: transparent white transparent transparent;
        }

        .wa-time {
            font-size: 11px;
            color: #999;
            text-align: right;
            margin-top: 4px;
            display: block;
        }
    </style>
</head>
<body class="md2-theme">
    <div class="header">
        <h1>
            <span class="material-icons">rocket_launch</span>
            Notice System
        </h1>
        <div class="status-badge ${ready ? 'status-connected' : 'status-disconnected'}">
            <span style="width: 8px; height: 8px; border-radius:50%; background: currentColor;"></span>
            ${ready ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
        </div>
    </div>

    <div class="container">
        <!-- System Stats -->
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                <h3><span class="material-icons">insights</span> Estado del Sistema</h3>
                <span style="color: var(--text-medium); font-size: 13px;">
                    Vence el: <strong style="color:var(--text-high);">${stats.lastCheck || 'N/A'}</strong>
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
                    <span class="stat-value" style="color: #ffb300;">${stats.invalid || 0}</span>
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
                    <p style="font-size: 16px; color: var(--text-high); margin-bottom: 24px;">WhatsApp no está vinculado o ha perdido la conexión.</p>
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
