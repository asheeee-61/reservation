@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header" 
      style="background: linear-gradient(135deg, 
             #1A73E8 0%, #1557B0 100%);">
    <p class="header-restaurant">
      {{ config('app.restaurant_name', 'Hotaru Madrid') }}
    </p>
    <h1 class="header-title">
      Solicitud de reserva recibida
    </h1>
    <p class="header-subtitle">
      Le confirmaremos en breve
    </p>
    <span class="header-badge">Pendiente de confirmacion</span>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">
  Estimado/a {{ $reservation->customer->name }},
</p>
<p class="body-text">
  Hemos recibido su solicitud de reserva en 
  {{ config('app.restaurant_name', 'Hotaru Madrid') }}.
  Nuestro equipo la revisara en breve y le enviara 
  una confirmacion lo antes posible.
</p>

<span class="reference-chip">
  Referencia: #{{ $reservation->reservation_id }}
</span>

<div class="details-card">
  <div class="details-card-header">
    Detalles de la reserva
  </div>
  <div class="details-row">
    <span class="details-label">Fecha</span>
    <span class="details-value">
      {{ \Carbon\Carbon::parse($reservation->date)
         ->locale('es')
         ->isoFormat('dddd, D [de] MMMM [de] YYYY') }}
    </span>
  </div>
  <div class="details-row">
    <span class="details-label">Hora</span>
    <span class="details-value">
      {{ $reservation->time }}
    </span>
  </div>
  <div class="details-row">
    <span class="details-label">Personas</span>
    <span class="details-value">
      {{ $reservation->guests }}
    </span>
  </div>
  <div class="details-row">
    <span class="details-label">Zona</span>
    <span class="details-value">
      {{ $reservation->zone->name ?? 'General' }}
    </span>
  </div>
  <div class="details-row">
    <span class="details-label">Ocasion</span>
    <span class="details-value">
      {{ $reservation->specialEvent->name ?? 'Sin evento especial' }}
    </span>
  </div>
</div>

<div class="alert-box alert-info">
  <span class="alert-box-icon">i</span>
  <span>
    Si necesita modificar o cancelar su solicitud,
    no dude en contactarnos directamente antes 
    de recibir la confirmacion.
  </span>
</div>
@endsection
