@extends('emails.reservations.layout')

@section('title', 'Reserva recibida – ' . ($settings['business_name'] ?? 'Hechizo'))

@section('status-title', 'Reserva recibida')

@section('sub-text')
    Hola {{ $cName }}, hemos recibido tu solicitud de reserva. Nos pondremos en contacto contigo para confirmarla.
@endsection

@if(!empty($settings['confirmation_policy']))
@section('extra-top')
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
        <tr>
            <td style="font-size:12px; font-family:Arial,sans-serif; color:rgba(232,223,200,0.4); line-height:1.6; border-left:2px solid rgba(196,160,72,0.3); padding-left:12px;">
                {{ $settings['confirmation_policy'] }}
            </td>
        </tr>
    </table>
@endsection
@endif
