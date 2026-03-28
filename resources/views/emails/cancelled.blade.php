@extends('emails.layout')

@section('content')
    <h2>Hola {{ $reservation->customer->name }},</h2>
    <p>Su reserva en {{ config('app.restaurant_name', 'Nuestro Restaurante') }} ha sido <strong>CANCELADA</strong>.</p>
    
    @if($reservation->cancellation_reason)
        <p><strong>Motivo:</strong> {{ $reservation->cancellation_reason }}</p>
    @endif
    
    <div class="info-box">
        <div class="info-item"><span class="info-label">ID de Reserva:</span> {{ $reservation->reservation_id }}</div>
        <div class="info-item"><span class="info-label">Fecha original:</span> {{ \Carbon\Carbon::parse($reservation->date)->format('d/m/Y') }}</div>
        <div class="info-item"><span class="info-label">Hora:</span> {{ $reservation->time }}</div>
    </div>

    <p>Le esperamos pronto. Si desea realizar una nueva reserva, no dude en contactarnos de nuevo.</p>
@endsection
