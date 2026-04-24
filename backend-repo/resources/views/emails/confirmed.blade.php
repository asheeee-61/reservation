@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header">
    <p class="header-restaurant">{{ $businessName }}</p>
    <h1 class="header-title" style="color: #1a73e8;">¡Reserva Confirmada!</h1>
    <div style="display: inline-block; background: #e8f0fe; color: #1a73e8; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; margin-top: 16px; letter-spacing: 0.5px;">
        Te esperamos
    </div>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">Genial {{ $reservation->customer->name }},</p>
<p class="body-text">
  Tu reserva en <strong>{{ $businessName }}</strong> ha sido confirmada satisfactoriamente. Aquí tienes los detalles para tu visita.
</p>

<div class="details-container">
  <div class="details-row">
    <span class="details-label">Referencia</span>
    <span class="details-value">#{{ $reservation->reservation_id }}</span>
  </div>
  <div class="details-row">
    <span class="details-label">Fecha y Hora</span>
    <span class="details-value">
      {{ \Carbon\Carbon::parse($reservation->date)->locale('es')->isoFormat('D [de] MMMM') }} a las {{ \Carbon\Carbon::parse($reservation->time)->format('H:i') }}
    </span>
  </div>
  <div class="details-row">
    <span class="details-label">Comensales</span>
    <span class="details-value">{{ $reservation->guests }} personas</span>
  </div>
  <div class="details-row">
    <span class="details-label">Zona</span>
    <span class="details-value">{{ $reservation->zone->name ?? 'Estándar' }}</span>
  </div>
</div>

<div class="cta-container">
  <a href="{{ $googleMapsLink ?? '#' }}" class="cta-button">Ver ubicación en Maps</a>
</div>

<p class="body-text" style="font-size: 13px; color: #70757a; text-align: center;">
  Si no puedes asistir, por favor cancela tu reserva con antelación para que otros puedan disfrutar del espacio.
</p>
@endsection
