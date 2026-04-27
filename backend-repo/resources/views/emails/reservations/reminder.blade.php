@extends('emails.reservations.layout')

@php
    $isToday = \Carbon\Carbon::parse($reservation->reserved_at)->isToday();
@endphp

@section('title', $isToday ? 'Tu mesa es hoy' : 'Tu mesa es mañana')
@section('icon-bg', '#e8f0fe')
@section('icon-color', '#1a73e8')
@section('badge-bg', '#e8f0fe')
@section('badge-color', '#1a73e8')

@section('status-icon')
<!-- bell icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:32px; height:32px; fill:currentColor; vertical-align: middle;"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
@endsection

@section('badge-label', 'Recordatorio')
@section('status-title', $isToday ? 'Tu mesa es hoy' : 'Tu mesa es mañana')

