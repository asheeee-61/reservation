@extends('emails.reservations.layout')

@section('title', 'Tu reservación fue cancelada')
@section('icon-bg', '#fce8e6')
@section('icon-color', '#d93025')
@section('badge-bg', '#fce8e6')
@section('badge-color', '#d93025')

@section('status-icon')
<!-- X icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:32px; height:32px; fill:currentColor; vertical-align: middle;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
@endsection

@section('badge-label', 'Cancelada')
@section('status-title', 'Tu reservación fue cancelada')

@section('actions')
    @if(!empty($settings['phone']))
    <a href="tel:{{ preg_replace('/[^0-9\+]/', '', $settings['phone']) }}" class="btn btn-outline" style="display: inline-block; padding: 10px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #dadce0; color: #5f6368;">Llamar</a>
    @endif
    <a href="{{ rtrim($settings['website'] ?? config('app.url'), '/') }}" class="btn btn-primary" style="display: inline-block; padding: 10px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #1a73e8; color: #ffffff; background-color: #1a73e8;">Reservar de nuevo</a>
@endsection
