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

