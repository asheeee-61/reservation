@extends('emails.reservations.layout')

@section('title', '¿Cómo estuvo tu visita?')
@section('icon-bg', '#fef7e0')
@section('icon-color', '#f29900')
@section('badge-bg', '#fef7e0')
@section('badge-color', '#f29900')

@section('status-icon')
<!-- star icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:32px; height:32px; fill:currentColor; vertical-align: middle;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/></svg>
@endsection

@section('badge-label', 'Visita completada')
@section('status-title', '¿Cómo estuvo tu visita?')

@section('extra-status')
    <p style="margin: 0 0 16px; font-size: 14px; color: #5f6368; line-height: 1.5; text-align: center;">
        Valoramos mucho tu opinión. Si tienes un momento, nos ayudaría mucho que compartieras tu experiencia.
    </p>
    @if(!empty($settings['google_maps_link']))
    <div style="margin: 24px 0; text-align: center;">
        <a href="{{ $settings['google_maps_link'] }}" style="display: inline-block; padding: 12px 32px; background-color: #f29900; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);">
            Dejar una Reseña
        </a>
    </div>
    @endif
@endsection

