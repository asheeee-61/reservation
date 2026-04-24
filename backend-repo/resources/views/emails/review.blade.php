@extends('emails.layout')

@section('header')
<tr>
  <td class="email-header">
    <p class="header-restaurant">{{ $businessName }}</p>
    <h1 class="header-title">¡Gracias por tu visita!</h1>
    <div style="display: inline-block; background: #e8f0fe; color: #1a73e8; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; margin-top: 16px; letter-spacing: 0.5px;">
        Tu opinión nos importa
    </div>
  </td>
</tr>
@endsection

@section('body')
<p class="greeting">Hola {{ $reservation->customer->name }},</p>
<p class="body-text">
  Esperamos que hayas disfrutado de tu experiencia en <strong>{{ $businessName }}</strong> tanto como nosotros disfrutamos recibiéndote.
</p>
<p class="body-text">
  Nos encantaría conocer tu opinión para seguir mejorando y ofreciendo el mejor servicio posible. ¿Te importaría dedicarnos un minuto?
</p>

@if($reviewLink)
<div class="cta-container">
  <a href="{{ $reviewLink }}" class="cta-button">Dejar una opinión</a>
</div>
@endif

<div style="margin-top: 32px; text-align: center; color: #70757a; font-size: 13px;">
    Referencia de visita: #{{ $reservation->reservation_id }}
</div>

<p class="body-text" style="margin-top: 32px; text-align: center;">
  ¡Esperamos volver a verte muy pronto!
</p>
@endsection
