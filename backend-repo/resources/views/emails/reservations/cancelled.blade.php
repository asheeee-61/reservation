@extends('emails.reservations.layout')

@section('title', 'Reserva cancelada – ' . ($settings['business_name'] ?? 'Hechizo'))

@section('status-title', 'Reserva cancelada')

@section('sub-text')
    Hola {{ $reservation->customer->name ?? '' }}, lamentamos informarte que tu reserva ha sido cancelada.
@endsection

@section('extra')
    @if(!empty($reservation->cancellation_reason))
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:36px;">
        <tr>
            <td style="padding:16px; border-left:2px solid rgba(196,160,72,0.4); background-color:rgba(196,160,72,0.04);">
                <p style="margin:0 0 4px; font-size:11px; font-family:Arial,sans-serif; color:rgba(232,223,200,0.4); text-transform:uppercase; letter-spacing:0.1em;">Motivo</p>
                <p style="margin:0; font-size:13px; font-family:Arial,sans-serif; color:rgba(232,223,200,0.7); line-height:1.5;">{{ $reservation->cancellation_reason }}</p>
            </td>
        </tr>
    </table>
    @endif
@endsection
