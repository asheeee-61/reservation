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
    @if(!empty($settings['phone']))
    <a href="tel:{{ preg_replace('/[^0-9\+]/', '', $settings['phone']) }}" class="btn btn-outline" style="display: inline-block; padding: 10px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #dadce0; color: #5f6368;">Llamar</a>
    @endif
    @if(!empty($settings['address']))
    <a href="https://maps.google.com/?q={{ urlencode(($settings['business_name'] ?? '') . ' ' . $settings['address']) }}" class="btn btn-primary" style="display: inline-block; padding: 10px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #1a73e8; color: #ffffff; background-color: #1a73e8;">Cómo llegar</a>
    @endif
@endsection
