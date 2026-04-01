@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header"
      style="background: linear-gradient(135deg,
             #1A73E8 0%, #1557B0 100%);">
    <p class="header-restaurant">
      {{ config('app.restaurant_name', 'Hotaru Madrid') }}
    </p>
    <h1 class="header-title">Reserva confirmada</h1>
    <p class="header-subtitle">
      Le esperamos con mucho gusto
    </p>
    <span class="header-badge">Confirmada</span>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">
  Estimado/a {{ $reservation->customer->name }},
</p>
<p class="body-text">
  Nos complace confirmarle su reserva en 
  {{ config('app.restaurant_name', 'Hotaru Madrid') }}.
  Todo esta listo para recibirle y esperamos 
  que disfrute de una experiencia excepcional.
</p>

<span class="reference-chip">
  Referencia: #{{ $reservation->reservation_id }}
</span>

<div class="details-card">
  <div class="details-card-header">
    Detalles de su reserva confirmada
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

<div class="alert-box alert-success">
  <span class="alert-box-icon">✓</span>
  <span>
    Su reserva esta confirmada. Si tiene algun 
    imprevisto, le agradeceriamos que nos lo 
    comunicara con la mayor brevedad posible.
  </span>
</div>
@endsection
