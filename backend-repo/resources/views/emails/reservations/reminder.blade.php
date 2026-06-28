@extends('emails.reservations.layout')

@php
    $isToday  = \Carbon\Carbon::parse($reservation->date)->isToday();
    $resDate  = \Carbon\Carbon::parse($reservation->date . ' ' . $reservation->time)->locale('es');
@endphp

@section('title', ($isToday ? 'Tu visita es hoy' : 'Tu visita es mañana') . ' – ' . ($settings['business_name'] ?? 'Hechizo'))

@section('status-title', $isToday ? 'Tu visita es hoy' : 'Tu visita es mañana')

@section('sub-text')
    Hola {{ $reservation->customer->name ?? '' }}, te recordamos tu reserva para {{ $isToday ? 'hoy' : 'mañana' }} a las {{ $resDate->format('H:i') }} h. Te esperamos.
@endsection
