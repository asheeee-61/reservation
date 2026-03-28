@extends('emails.layout')

@section('content')
    <h2>Hola {{ $reservation->customer->name }},</h2>
    <p>Hemos recibido su solicitud de reserva. Su reserva se encuentra actualmente en estado <strong>PENDIENTE</strong> de confirmación por nuestro equipo.</p>
    
    <div class="info-box">
        <div class="info-item"><span class="info-label">ID de Reserva:</span> {{ $reservation->reservation_id }}</div>
        <div class="info-item"><span class="info-label">Fecha:</span> {{ \Carbon\Carbon::parse($reservation->date)->format('d/m/Y') }}</div>
        <div class="info-item"><span class="info-label">Hora:</span> {{ $reservation->time }}</div>
        <div class="info-item"><span class="info-label">Personas:</span> {{ $reservation->guests }}</div>
        @if($reservation->tableType)
            <div class="info-item"><span class="info-label">Ubicación:</span> {{ $reservation->tableType->name }}</div>
        @endif
    </div>

    <p>Le contactaremos en breve para confirmar su asistencia. Si necesita realizar algún cambio, no dude en contactarnos.</p>
@endsection
