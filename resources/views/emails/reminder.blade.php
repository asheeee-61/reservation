@extends('emails.layout')

@section('content')
    <h2>¡Hola de nuevo {{ $reservation->customer->name }}!</h2>
    <p>Le recordamos que su reserva en {{ config('app.restaurant_name', 'Nuestro Restaurante') }} es hoy. Le esperamos muy pronto.</p>
    
    <div class="info-box">
        <div class="info-item"><span class="info-label">Fecha:</span> {{ \Carbon\Carbon::parse($reservation->date)->toFormattedDateString() }}</div>
        <div class="info-item"><span class="info-label">Hora:</span> {{ $reservation->time }}</div>
        <div class="info-item"><span class="info-label">Personas:</span> {{ $reservation->guests }}</div>
        @if($reservation->tableType)
            <div class="info-item"><span class="info-label">Ubicación:</span> {{ $reservation->tableType->name }}</div>
        @endif
    </div>

    <p>Recuerde avisarnos si por cualquier motivo no puede acudir.</p>
@endsection
