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

