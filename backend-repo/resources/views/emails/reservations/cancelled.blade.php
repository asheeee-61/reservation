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

@section('extra-status')
    @if(!empty($reservation->cancellation_reason))
    <div style="margin: 16px auto 0; max-width: 80%; padding: 12px 16px; background-color: #fbdaca; border-radius: 8px; font-size: 14px; color: #a50e0e; line-height: 1.5; text-align: left;">
        <strong style="display: block; margin-bottom: 4px;">Motivo:</strong>
        {{ $reservation->cancellation_reason }}
    </div>
    @endif
@endsection

@section('actions')
    <a href="{{ rtrim($settings['website'] ?? config('app.url'), '/') }}" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #1a73e8; color: #ffffff; background-color: #1a73e8;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm-8-4h2v-2h2v-2h-2V9h-2v2h-2v2h2v2z"/></svg>Reservar de nuevo
    </a>
    @if(!empty($settings['phone']))
    <a href="tel:{{ preg_replace('/[^0-9\+]/', '', $settings['phone']) }}" class="btn btn-outline" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #dadce0; color: #5f6368;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>Llamar
    </a>
    @endif
@endsection
