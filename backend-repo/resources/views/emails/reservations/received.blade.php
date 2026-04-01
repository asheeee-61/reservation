@extends('emails.reservations.layout')

@section('title', 'Tu reservación está siendo revisada')
@section('icon-bg', '#fef7e0')
@section('icon-color', '#f29900')
@section('badge-bg', '#fef7e0')
@section('badge-color', '#f29900')

@section('status-icon')
<!-- clock icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:32px; height:32px; fill:currentColor; vertical-align: middle;"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
@endsection

@section('badge-label', 'Pendiente de confirmación')
@section('status-title', 'Tu reservación está siendo revisada')

@section('extra-status')
    @if(!empty($settings['confirmation_policy']))
    <p style="margin: 8px 0 0; font-size: 14px; color: #5f6368; line-height: 1.5;">
        {{ $settings['confirmation_policy'] }}
    </p>
    @endif
@endsection

@section('actions')
    <a href="{{ rtrim($settings['website'] ?? config('app.url'), '/') }}" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #1a73e8; color: #ffffff; background-color: #1a73e8;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z"/></svg>Ver reservación
    </a>
    @if(!empty($settings['phone']))
    <a href="tel:{{ preg_replace('/[^0-9\+]/', '', $settings['phone']) }}" class="btn btn-outline" style="display: inline-block; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #dadce0; color: #5f6368;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: currentColor; vertical-align: text-bottom; margin-right: 6px;"><path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>Llamar
    </a>
    @endif
@endsection
