@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header">
    <p class="header-restaurant">{{ $businessName }}</p>
    <h1 class="header-title">Recordatorio de hoy</h1>
    <div style="display: inline-block; background: #e8f0fe; color: #1a73e8; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; margin-top: 16px; letter-spacing: 0.5px;">
        Te vemos en breve
    </div>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">Hola {{ $reservation->customer->name }},</p>
<p class="body-text">
  Te recordamos que tienes una reserva hoy en <strong>{{ $businessName }}</strong>. Todo está listo para recibirte.
</p>

<div class="details-container">
  <div class="details-row">
    <span class="details-label">Hora de llegada</span>
    <span class="details-value" style="color: #1a73e8; font-weight: 500; font-size: 20px;">{{ $reservation->time }}</span>
  </div>
  <div class="details-row">
    <span class="details-label">Fecha</span>
    <span class="details-value">Hoy, {{ \Carbon\Carbon::parse($reservation->date)->locale('es')->isoFormat('D [de] MMMM') }}</span>
  </div>
  <div class="details-row">
    <span class="details-label">Comensales</span>
    <span class="details-value">{{ $reservation->guests }} pax</span>
  </div>
  <div class="details-row">
    <span class="details-label">Referencia</span>
    <span class="details-value">#{{ $reservation->reservation_id }}</span>
  </div>
</div>

<p class="body-text" style="font-size: 13px; color: #70757a; text-align: center;">
  Por favor, si tus planes han cambiado y no puedes asistir, avísanos cancelando tu reserva.
</p>
@endsection
