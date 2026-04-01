@extends('emails.reservations.layout')

@section('title', 'Reservación confirmada')
@section('icon-bg', '#e6f4ea')
@section('icon-color', '#1e8e3e')
@section('badge-bg', '#e6f4ea')
@section('badge-color', '#1e8e3e')

@section('status-icon')
<!-- checkmark icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:32px; height:32px; fill:currentColor; vertical-align: middle;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
@endsection

@section('badge-label', 'Confirmada')
@section('status-title', 'Reservación confirmada')

@section('actions')
    @if(!empty($settings['address']))
    <a href="https://maps.google.com/?q={{ urlencode(($settings['business_name'] ?? '') . ' ' . $settings['address']) }}" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #1a73e8; color: #ffffff; background-color: #1a73e8;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>Cómo llegar
    </a>
    @endif
    @if(!empty($settings['phone']))
    <a href="tel:{{ preg_replace('/[^0-9\+]/', '', $settings['phone']) }}" class="btn btn-outline" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #dadce0; color: #5f6368;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>Llamar
    </a>
    @endif
@endsection
