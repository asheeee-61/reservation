@extends('emails.reservations.layout')

@section('title', 'Reserva confirmada – ' . ($settings['business_name'] ?? 'Hechizo'))

@section('status-title', 'Reserva confirmada')

@section('sub-text')
    Hola {{ $reservation->customer->name ?? '' }}, tu reserva ha sido confirmada. Te esperamos.
@endsection
