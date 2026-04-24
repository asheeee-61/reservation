@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header">
    <p class="header-restaurant">{{ $businessName }}</p>
    <h1 class="header-title">Solicitud Recibida</h1>
    <div style="display: inline-block; background: #e8f0fe; color: #1a73e8; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; margin-top: 16px; letter-spacing: 0.5px;">
        Pendiente de confirmación
    </div>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">Hola {{ $reservation->customer->name }},</p>
<p class="body-text">
  Hemos recibido correctamente su solicitud de reserva en <strong>{{ $businessName }}</strong>. 
  Nuestro equipo verificará la disponibilidad y le enviará una confirmación oficial en breve.
</p>

<div class="details-container">
  <div class="details-row">
    <span class="details-label">Referencia</span>
    <span class="details-value">#{{ $reservation->reservation_id }}</span>
  </div>
  <div class="details-row">
    <span class="details-label">Fecha</span>
    <span class="details-value">
      {{ \Carbon\Carbon::parse($reservation->date)->locale('es')->isoFormat('dddd, D [de] MMMM') }}
    </span>
  </div>
  <div class="details-row">
    <span class="details-label">Hora</span>
    <span class="details-value">{{ $reservation->time }}</span>
  </div>
  <div class="details-row">
    <span class="details-label">Comensales</span>
    <span class="details-value">{{ $reservation->guests }} pax</span>
  </div>
  <div class="details-row">
    <span class="details-label">Zona</span>
    <span class="details-value">{{ $reservation->zone->name ?? 'Estándar' }}</span>
  </div>
</div>

<p class="body-text" style="font-size: 13px; color: #70757a;">
  Si necesita realizar algún cambio antes de recibir la confirmación, por favor contáctenos directamente.
</p>
@endsection
