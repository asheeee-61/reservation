@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header"
      style="background: linear-gradient(135deg,
             #1A73E8 0%, #1557B0 100%);">
    <p class="header-restaurant">
      {{ $restaurantName }}
    </p>
    <h1 class="header-title">Reserva cancelada</h1>
    <p class="header-subtitle">
      Le pedimos disculpas por los inconvenientes
    </p>
    <span class="header-badge">Cancelada</span>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">
  Estimado/a {{ $reservation->customer->name }},
</p>
<p class="body-text">
  Lamentamos informarle que su reserva en 
  {{ $restaurantName }}
  ha sido cancelada por nuestra parte. 
  Le pedimos disculpas por los inconvenientes causados.
</p>

<span class="reference-chip">
  Reserva cancelada: #{{ $reservation->reservation_id }}
</span>

<div class="details-card">
  <div class="details-card-header">
    Reserva cancelada
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
</div>

@if($reason)
<div class="alert-box alert-error">
  <span class="alert-box-icon">!</span>
  <span>
    <strong>Motivo:</strong> {{ $reason }}
  </span>
</div>
@else
<div class="alert-box alert-warning">
  <span class="alert-box-icon">!</span>
  <span>
    Si desea realizar una nueva reserva o necesita 
    mas informacion, estamos a su completa disposicion.
  </span>
</div>
@endif
@endsection
