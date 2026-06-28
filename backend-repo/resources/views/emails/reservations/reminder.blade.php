@extends('emails.reservations.layout')

@php
    $isToday = \Carbon\Carbon::parse($reservation->date)->isToday();
@endphp

@section('title', ($isToday ? 'Tu visita es hoy' : 'Tu visita es mañana') . ' – ' . ($settings['business_name'] ?? 'Hechizo'))

@section('status-title', $isToday ? 'Tu visita es hoy' : 'Tu visita es mañana')

@section('sub-text')
    Hola {{ $cName }}, te recordamos tu reserva para {{ $isToday ? 'hoy' : 'mañana' }} a las {{ $resDate->format('H:i') }} h. Te esperamos.
@endsection
