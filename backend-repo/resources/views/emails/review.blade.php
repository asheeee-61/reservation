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
      Gracias por su visita
    </h1>
    <p class="header-subtitle">
      Esperamos que haya sido de su agrado
    </p>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">
  Estimado/a {{ $reservation->customer->name }},
</p>
<p class="body-text">
  Esperamos que su visita a 
  {{ config('app.restaurant_name', 'Hotaru Madrid') }} 
  haya sido de su agrado y que la experiencia 
  haya superado sus expectativas.
</p>
<p class="body-text">
  Su opinion es muy valiosa para nosotros y nos 
  ayuda a seguir mejorando cada dia. Si dispone 
  de un momento, le agradeceriamos enormemente 
  que compartiera su experiencia.
</p>

@if($reviewLink)
<div class="cta-container">
  <a href="{{ $reviewLink }}" 
     class="cta-button"
     target="_blank">
    Dejar una valoracion
  </a>
</div>
@endif

<div class="alert-box alert-info">
  <span class="alert-box-icon">i</span>
  <span>
    Referencia de su visita: 
    <strong>#{{ $reservation->reservation_id }}</strong>
  </span>
</div>

<p class="body-text" style="margin-top: 16px;">
  Muchas gracias por elegirnos. 
  Esperamos volver a verle pronto.
</p>
@endsection
