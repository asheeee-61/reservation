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

@section('actions')
    @if(!empty($settings['address']))
    <a href="https://maps.google.com/?q={{ urlencode(($settings['business_name'] ?? '') . ' ' . $settings['address']) }}" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #1a73e8; color: #ffffff; background-color: #1a73e8;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>Cómo llegar
    </a>
    @endif
    <a href="{{ rtrim($settings['website'] ?? config('app.url'), '/') }}" class="btn btn-outline" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #dadce0; color: #5f6368;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>Cancelar
    </a>
@endsection
