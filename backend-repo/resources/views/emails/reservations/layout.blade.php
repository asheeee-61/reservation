<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Notificación de Reservación')</title>
    <!-- CSS is kept here for reference but also mostly inline to survive email clients -->
    <style>
        body { margin: 0; padding: 0; background-color: #f7f9fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #202124; }
        @media only screen and (max-width: 480px) {
            .wrapper { padding: 16px 8px !important; }
            .container { border-radius: 8px !important; }
            .btn { display: block !important; width: auto !important; margin: 8px 0 !important; box-sizing: border-box !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #202124;">
    @php
        $bName = $settings['business_name'] ?? 'Reserva';
        $resDate = \Carbon\Carbon::parse($reservation->reserved_at);
        $resDate->locale('es');
    @endphp
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f7f9fa; padding: 32px 16px; box-sizing: border-box;">
        <tr>
            <td align="center">
                <table class="container" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 500px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);">
                    <!-- Header Logo -->
                    @if(!empty($settings['logo_url']))
                    <tr>
                        <td class="header-logo" style="text-align: center; padding: 24px 24px 0 24px;">
                            <img src="{{ $settings['logo_url'] }}" alt="{{ $bName }}" style="max-height: 48px; max-width: 100%;" />
                        </td>
                    </tr>
                    @endif

                    <!-- Status Section -->
                    <tr>
                        <td class="status-section" style="text-align: center; padding: 32px 24px 24px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div class="status-icon" style="width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px; display: inline-block; text-align: center; line-height: 64px; background-color: @yield('icon-bg', '#e8f0fe'); color: @yield('icon-color', '#1a73e8');">
                                            @yield('status-icon')
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <div class="badge" style="display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 500; margin-bottom: 8px; background-color: @yield('badge-bg', '#e8f0fe'); color: @yield('badge-color', '#1a73e8');">
                                            @yield('badge-label')
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <h1 class="status-title" style="margin: 0 0 8px; font-size: 22px; font-weight: 500; line-height: 1.3; color: #202124;">@yield('status-title')</h1>
                                    </td>
                                </tr>
                            </table>
                            @yield('extra-status')
                        </td>
                    </tr>

                    <!-- Cover Photo -->
                    @if(!empty($settings['cover_image_url']))
                    <tr>
                        <td>
                            <img src="{{ $settings['cover_image_url'] }}" alt="Cover" class="cover-photo" style="width: 100%; height: auto; max-height: 200px; object-fit: cover; display: block;" />
                        </td>
                    </tr>
                    @endif

                    <!-- Reservation Info -->
                    <tr>
                        <td class="reservation-info" style="padding: 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td width="72" valign="top" style="padding-right: 16px;">
                                        <div class="date-badge" style="background-color: #e8f0fe; color: #1a73e8; border-radius: 8px; padding: 12px 0; text-align: center;">
                                            <div class="date-month" style="font-size: 12px; font-weight: 600; text-transform: uppercase; line-height: 1.2; margin-bottom: 4px;">{{ $resDate->translatedFormat('M') }}</div>
                                            <div class="date-day" style="font-size: 24px; font-weight: 400; line-height: 1;">{{ $resDate->format('d') }}</div>
                                        </div>
                                    </td>
                                    <td valign="top" class="details-col">
                                        <h2 class="business-title" style="font-size: 18px; font-weight: 500; margin: 0 0 4px; color: #202124;">{{ $bName }}</h2>
                                        <p class="reservation-meta" style="font-size: 14px; color: #5f6368; margin: 0; line-height: 1.5;">
                                            {{ $resDate->translatedFormat('D \· H:i') }} ({{ !empty($settings['timezone']) ? $settings['timezone'] : 'CEST' }})<br>
                                            Reservación para {{ $reservation->guests }} {{ $reservation->guests == 1 ? 'persona' : 'personas' }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td><div class="divider" style="height: 1px; background-color: #e8eaed; margin: 0 24px;"></div></td>
                    </tr>

                    <!-- Business Details -->
                    <tr>
                        <td class="business-details" style="padding: 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                @if(!empty($settings['address']))
                                <tr>
                                    <td class="detail-icon-td" style="width: 32px; vertical-align: top; padding-bottom: 12px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #5f6368;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                    </td>
                                    <td class="detail-text-td" style="vertical-align: top; padding-top: 2px; font-size: 14px; color: #5f6368; padding-bottom: 12px;">
                                        <span>{{ $settings['address'] }}</span>
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($settings['phone']))
                                <tr>
                                    <td class="detail-icon-td" style="width: 32px; vertical-align: top; padding-bottom: 12px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #5f6368;"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                                    </td>
                                    <td class="detail-text-td" style="vertical-align: top; padding-top: 2px; font-size: 14px; color: #5f6368; padding-bottom: 12px;">
                                        <a href="tel:{{ preg_replace('/[^0-9\+]/', '', $settings['phone']) }}" style="color:#5f6368; text-decoration: none;">{{ $settings['phone'] }}</a>
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($settings['website']))
                                <tr>
                                    <td class="detail-icon-td" style="width: 32px; vertical-align: top; padding-bottom: 12px;">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #5f6368;"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                                    </td>
                                    <td class="detail-text-td" style="vertical-align: top; padding-top: 2px; font-size: 14px; color: #5f6368; padding-bottom: 12px;">
                                        <a href="{{ $settings['website'] }}" target="_blank" style="color:#1a73e8; text-decoration: none;">{{ parse_url($settings['website'], PHP_URL_HOST) ?? $settings['website'] }}</a>
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($settings['opening_hours']))
                                <tr>
                                    <td class="detail-icon-td" style="width: 32px; vertical-align: top;">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #5f6368;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                                    </td>
                                    <td class="detail-text-td" style="vertical-align: top; padding-top: 2px; font-size: 14px; color: #5f6368;">
                                        <span>{{ $settings['opening_hours'] }}</span>
                                    </td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>

                    @yield('extra')

                    @if(!empty($settings['email_footer_note']))
                    <tr>
                        <td style="padding: 0 24px 24px; font-size: 13px; color: #5f6368; text-align: center;">
                            {{ $settings['email_footer_note'] }}
                        </td>
                    </tr>
                    @endif

                    <!-- Actions Section -->
                    <tr>
                        <td class="actions-section" style="padding: 0 24px 32px; text-align: center;">
                            @yield('actions')
                        </td>
                    </tr>
                </table>
                
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td class="footer" style="padding: 24px; text-align: center; font-size: 12px; color: #9aa0a6; line-height: 1.5;">
                            Este correo fue enviado a {{ $reservation->customer_email }} referente a tu reservación #{{ $reservation->id }}<br>
                            @if(!empty($settings['show_powered_by']))
                            Desarrollado por el Centro de Reservaciones
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
