<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>{{ $businessName }}</title>
  <style>
    /* Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }

    /* MD2 Light Base */
    body {
      background-color: #f8f9fa;
      font-family: 'Roboto', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #202124;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .email-wrapper {
      width: 100%;
      background-color: #f8f9fa;
      padding: 40px 16px;
    }

    .email-card {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }

    /* Header */
    .email-header {
      padding: 40px 48px 32px;
      text-align: center;
      background: #ffffff;
      border-bottom: 1px solid #f1f3f4;
    }
    
    .header-restaurant {
      font-size: 12px;
      font-weight: 500;
      color: #1a73e8;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .header-title {
      font-size: 26px;
      font-weight: 400;
      color: #202124;
      line-height: 1.3;
      margin: 0;
    }

    /* Body */
    .email-body {
      padding: 40px 48px 48px;
    }

    .greeting {
      font-size: 18px;
      font-weight: 500;
      color: #202124;
      margin-bottom: 16px;
    }

    .body-text {
      font-size: 15px;
      color: #5f6368;
      line-height: 1.7;
      margin-bottom: 24px;
    }

    /* Details styling (MD2 List Style) */
    .details-container {
      background: #f8f9fa;
      border-radius: 4px;
      padding: 24px;
      margin: 24px 0;
      border: 1px solid #f1f3f4;
    }
    .details-row {
      padding: 12px 0;
      border-bottom: 1px solid #f1f3f4;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-size: 12px;
      color: #70757a;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .details-value {
      font-size: 15px;
      color: #202124;
      text-align: right;
    }

    /* MD2 Button */
    .cta-container {
      text-align: center;
      margin: 32px 0 16px;
    }
    .cta-button {
      display: inline-block;
      background-color: #1a73e8;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 1.25px;
      padding: 12px 32px;
      border-radius: 4px;
      text-transform: uppercase;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }

    /* Footer */
    .email-footer {
      padding: 32px 48px;
      text-align: center;
      background: #f8f9fa;
      border-top: 1px solid #f1f3f4;
    }
    .footer-text {
      font-size: 12px;
      color: #70757a;
      line-height: 1.6;
    }

    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 8px !important; }
      .email-header  { padding: 32px 24px 24px !important; }
      .email-body    { padding: 24px !important; }
      .header-title  { font-size: 22px !important; }
      .details-row   { flex-direction: column; align-items: flex-start; gap: 4px; }
      .details-value { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <table class="email-card" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      @yield('header')
      <tr>
        <td class="email-body">
          @yield('body')
          
          <div style="margin-top: 40px; border-top: 1px solid #f1f3f4; padding-top: 24px;">
            <p style="font-size: 14px; color: #70757a;">
              Atentamente,<br>
              <span style="font-weight: 500; color: #202124;">{{ $businessName }}</span>
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td class="email-footer">
          <p class="footer-text">
            Este es un mensaje automático de {{ $businessName }}.<br>
            © {{ date('Y') }} {{ $businessName }}. Todos los derechos reservados.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
