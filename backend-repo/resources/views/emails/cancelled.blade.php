@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header">
    <p class="header-restaurant">{{ $businessName }}</p>
    <h1 class="header-title" style="color: #d93025;">Reserva Cancelada</h1>
    <div style="display: inline-block; background: #fce8e6; color: #d93025; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; margin-top: 16px; letter-spacing: 0.5px;">
        Cancelada
    </div>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">Hola {{ $reservation->customer->name }},</p>
<p class="body-text">
  Lamentamos informarle que su reserva en <strong>{{ $businessName }}</strong> ha sido cancelada.
</p>

<div class="details-container">
  <div class="details-row">
    <span class="details-label">Referencia</span>
    <span class="details-value">#{{ $reservation->reservation_id }}</span>
  </div>
  <div class="details-row">
    <span class="details-label">Fecha</span>
    <span class="details-value">
      {{ \Carbon\Carbon::parse($reservation->date)->locale('es')->isoFormat('D [de] MMMM') }}
    </span>
  </div>
</div>

<p class="body-text">
  Esperamos poder recibirle en otra ocasión. Disculpe las molestias.
</p>

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
