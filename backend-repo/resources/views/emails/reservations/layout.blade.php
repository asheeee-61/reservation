<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Hechizo Hookah Lounge')</title>
</head>
<body style="margin:0; padding:0; background-color:#0e1a0f; font-family:Georgia,'Times New Roman',serif; color:#e8dfc8; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">

    @php
        $bName    = $settings['business_name'] ?? 'Hechizo';
        $resDate  = \Carbon\Carbon::parse($reservation->date . ' ' . $reservation->time)->locale('es');
        $cName    = $reservation->customer->name ?? '';
        $waPhone  = !empty($settings['whatsapp_phone']) ? preg_replace('/[^0-9]/', '', $settings['whatsapp_phone']) : null;
        $logoUrl  = !empty($settings['logo']) ? asset('storage/' . $settings['logo']) : null;
        $year     = date('Y');
    @endphp

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0e1a0f;">
        <tr>
            <td align="center" style="padding:48px 16px; background-color:#0e1a0f;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px; margin:0 auto;">
                    <tr>
                        <td style="padding:0 32px; background-color:#0e1a0f;">

                            {{-- Logo --}}
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="padding-bottom:40px;">
                                        @if($logoUrl)
                                            <img src="{{ $logoUrl }}" alt="{{ $bName }}" style="max-height:36px; max-width:160px; display:block;" />
                                        @else
                                            <span style="font-size:20px; letter-spacing:0.25em; color:#c4a048; text-transform:uppercase; font-family:Georgia,serif;">{{ $bName }}</span>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            {{-- Title --}}
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="padding-bottom:8px;">
                                        <h1 style="margin:0; font-size:22px; font-weight:normal; color:#e8dfc8; font-family:Georgia,serif; line-height:1.3;">@yield('status-title')</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom:36px;">
                                        <p style="margin:0; font-size:13px; color:rgba(232,223,200,0.5); font-family:Arial,sans-serif; line-height:1.6;">@yield('sub-text')</p>
                                    </td>
                                </tr>
                            </table>

                            @yield('extra-top')

                            {{-- Details block --}}
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid rgba(196,160,72,0.2); border-bottom:1px solid rgba(196,160,72,0.2); margin-bottom:36px;">
                                <tr>
                                    <td style="padding:20px 0;">

                                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                            <tr>
                                                <td style="font-size:13px; color:rgba(232,223,200,0.45); font-family:Arial,sans-serif; padding-bottom:10px; width:50%;">Fecha</td>
                                                <td style="font-size:13px; color:#e8dfc8; font-family:Arial,sans-serif; padding-bottom:10px; text-align:right;">{{ $resDate->isoFormat('dddd, D [de] MMMM') }}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size:13px; color:rgba(232,223,200,0.45); font-family:Arial,sans-serif; padding-bottom:10px;">Hora</td>
                                                <td style="font-size:13px; color:#e8dfc8; font-family:Arial,sans-serif; padding-bottom:10px; text-align:right;">{{ $resDate->format('H:i') }} h</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size:13px; color:rgba(232,223,200,0.45); font-family:Arial,sans-serif; padding-bottom:10px;">Personas</td>
                                                <td style="font-size:13px; color:#e8dfc8; font-family:Arial,sans-serif; padding-bottom:10px; text-align:right;">{{ $reservation->guests }}</td>
                                            </tr>
                                            @if(!empty($reservation->zone->name))
                                            <tr>
                                                <td style="font-size:13px; color:rgba(232,223,200,0.45); font-family:Arial,sans-serif; padding-bottom:10px;">Zona</td>
                                                <td style="font-size:13px; color:#e8dfc8; font-family:Arial,sans-serif; padding-bottom:10px; text-align:right;">{{ $reservation->zone->name }}</td>
                                            </tr>
                                            @endif
                                            @if(!empty($reservation->event->name))
                                            <tr>
                                                <td style="font-size:13px; color:rgba(232,223,200,0.45); font-family:Arial,sans-serif; padding-bottom:10px;">Evento</td>
                                                <td style="font-size:13px; color:#e8dfc8; font-family:Arial,sans-serif; padding-bottom:10px; text-align:right;">{{ $reservation->event->name }}</td>
                                            </tr>
                                            @endif
                                            <tr>
                                                <td style="font-size:13px; color:rgba(232,223,200,0.45); font-family:Arial,sans-serif;">Referencia</td>
                                                <td style="font-size:13px; color:#e8dfc8; font-family:Arial,sans-serif; text-align:right;">#{{ $reservation->reservation_id }}</td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                            @yield('extra')

                            {{-- Footer --}}
                            <p style="margin:0; font-size:11px; font-family:Arial,sans-serif; color:rgba(232,223,200,0.3); line-height:1.8;">
                                @if($waPhone)
                                    ¿Necesitas cambiar algo? Escríbenos por <a href="https://wa.me/{{ $waPhone }}" style="color:#c4a048; text-decoration:none;">WhatsApp</a>.<br>
                                @elseif(!empty($settings['business_phone']))
                                    ¿Necesitas cambiar algo? Llámanos al <a href="tel:{{ preg_replace('/[^0-9\+]/', '', $settings['business_phone']) }}" style="color:#c4a048; text-decoration:none;">{{ $settings['business_phone'] }}</a>.<br>
                                @endif
                                @if(!empty($settings['address']))
                                    {{ $settings['address'] }}<br>
                                @endif
                                © {{ $year }} {{ $bName }}
                            </p>

                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
