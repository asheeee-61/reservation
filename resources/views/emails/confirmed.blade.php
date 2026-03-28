@extends('emails.layout')

@section('content')
    <h2>Hola {{ $reservation->customer->name }},</h2>
    <p>Su reserva en {{ config('app.restaurant_name', 'Nuestro Restaurante') }} ha sido <strong>CONFIRMADA</strong>. Le esperamos con mucha ilusión.</p>
    
    <div class="info-box">
        <div class="info-item"><span class="info-label">ID de Reserva:</span> {{ $reservation->reservation_id }}</div>
        <div class="info-item"><span class="info-label">Fecha:</span> {{ \Carbon\Carbon::parse($reservation->date)->format('d/m/Y') }}</div>
        <div class="info-item"><span class="info-label">Hora:</span> {{ $reservation->time }}</div>
        <div class="info-item"><span class="info-label">Personas:</span> {{ $reservation->guests }}</div>
        @if($reservation->tableType)
            <div class="info-item"><span class="info-label">Ubicación:</span> {{ $reservation->tableType->name }}</div>
        @endif
    </div>

    <p>Le esperamos a su llegada. Si por cualquier motivo no puede acudir, le agradeceríamos que nos avisara con antelación.</p>
@endsection
