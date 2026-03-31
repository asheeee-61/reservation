<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>{{ config('app.restaurant_name', 'Hotaru Madrid') }}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
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

    /* Base */
    body {
      background-color: #F1F3F4;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #202124;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    /* Wrapper */
    .email-wrapper {
      width: 100%;
      background-color: #F1F3F4;
      padding: 32px 16px;
    }

    /* Card */
    .email-card {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12),
                  0 1px 2px rgba(0,0,0,0.08);
    }

    /* Header */
    .email-header {
      padding: 32px 40px 28px;
      position: relative;
    }
    .email-header::after {
      content: '';
      display: block;
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: rgba(255,255,255,0.2);
    }
    .header-restaurant {
      font-family: 'Google Sans', Arial, sans-serif;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.85);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .header-title {
      font-family: 'Google Sans', Arial, sans-serif;
      font-size: 24px;
      font-weight: 400;
      color: #FFFFFF;
      line-height: 1.3;
      margin: 0;
    }
    .header-subtitle {
      font-size: 14px;
      color: rgba(255,255,255,0.75);
      margin-top: 6px;
    }

    /* Status badge in header */
    .header-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.4);
      border-radius: 100px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 500;
      color: white;
      margin-top: 16px;
      letter-spacing: 0.25px;
    }

    /* Body */
    .email-body {
      padding: 32px 40px;
    }

    /* Greeting */
    .greeting {
      font-family: 'Google Sans', Arial, sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: #202124;
      margin-bottom: 12px;
    }

    /* Body text */
    .body-text {
      font-size: 14px;
      color: #5F6368;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    /* Reference chip */
    .reference-chip {
      display: inline-block;
      background: #E8F0FE;
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 500;
      color: #1A73E8;
      margin: 8px 0 24px;
      letter-spacing: 0.25px;
    }

    /* Details card */
    .details-card {
      background: #FAFAFA;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      overflow: hidden;
      margin: 8px 0 24px;
    }
    .details-card-header {
      background: #F1F3F4;
      padding: 10px 20px;
      border-bottom: 1px solid #E0E0E0;
      font-size: 11px;
      font-weight: 500;
      color: #70757A;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #F1F3F4;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-size: 13px;
      color: #70757A;
      font-weight: 500;
    }
    .details-value {
      font-size: 13px;
      color: #202124;
      text-align: right;
      font-weight: 400;
    }

    /* Alert boxes */
    .alert-box {
      border-radius: 4px;
      padding: 14px 16px;
      margin: 16px 0;
      font-size: 13px;
      line-height: 1.5;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .alert-box-icon {
      font-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .alert-info, .alert-success, .alert-warning, .alert-error {
      background: #E8F0FE;
      border-left: 3px solid #1A73E8;
      color: #174EA6;
    }

    /* CTA Button */
    .cta-container {
      text-align: center;
      margin: 24px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #1A73E8;
      color: #FFFFFF !important;
      text-decoration: none;
      font-family: 'Google Sans', Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.25px;
      padding: 12px 32px;
      border-radius: 4px;
      border: none;
    }
    .cta-button:hover {
      background-color: #1557B0;
    }

    /* Divider */
    .divider {
      border: none;
      border-top: 1px solid #E0E0E0;
      margin: 24px 0;
    }

    /* Sign off */
    .sign-off {
      font-size: 14px;
      color: #5F6368;
      margin-top: 24px;
    }
    .sign-off-name {
      font-family: 'Google Sans', Arial, sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: #202124;
      margin-top: 4px;
    }

    /* Footer */
    .email-footer {
      background: #F8F9FA;
      border-top: 1px solid #E0E0E0;
      padding: 20px 40px;
      text-align: center;
    }
    .footer-text {
      font-size: 11px;
      color: #9AA0A6;
      line-height: 1.6;
    }
    .footer-text a {
      color: #9AA0A6;
      text-decoration: underline;
    }

    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 8px !important; }
      .email-header  { padding: 24px 24px 20px !important; }
      .email-body    { padding: 24px !important; }
      .email-footer  { padding: 16px 24px !important; }
      .header-title  { font-size: 20px !important; }
      .details-row   { flex-direction: column; gap: 2px; }
      .details-value { text-align: left !important; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <table class="email-card" 
           width="100%" 
           cellpadding="0" 
           cellspacing="0"
           role="presentation">

      {{-- Header --}}
      @yield('header')

      {{-- Body --}}
      <tr>
        <td class="email-body">
          @yield('body')

          <hr class="divider">

          <p class="sign-off">
            Un saludo,<br>
            <span class="sign-off-name">
              {{ config('app.restaurant_name', 'Hotaru Madrid') }}
            </span>
          </p>
        </td>
      </tr>

      {{-- Footer --}}
      <tr>
        <td class="email-footer">
          <p class="footer-text">
            Este mensaje ha sido enviado por 
            <strong>
              {{ config('app.restaurant_name', 'Hotaru Madrid') }}
            </strong>
            en relacion a su reserva.<br>
            Si no ha realizado ninguna reserva, 
            ignore este mensaje.
          </p>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
