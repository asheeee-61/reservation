<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.restaurant_name', 'Restaurante') }}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; }
        .content { padding: 40px; }
        .footer { background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 30px; background-color: #c9a34a; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .info-box { background-color: #f9f9f9; border-left: 4px solid #c9a34a; padding: 20px; margin: 25px 0; }
        .info-item { margin-bottom: 10px; }
        .info-label { font-weight: bold; color: #555; }
        h1 { margin: 0; font-size: 24px; }
        p { margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ config('app.restaurant_name', 'Restaurante') }}</h1>
        </div>
        
        <div class="content">
            @yield('content')
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.restaurant_name', 'Restaurante') }}. Todos los derechos reservados.</p>
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
        </div>
    </div>
</body>
</html>
