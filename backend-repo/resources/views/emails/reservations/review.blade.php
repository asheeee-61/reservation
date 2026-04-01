@extends('emails.reservations.layout')

@section('title', '¿Cómo estuvo tu visita?')
@section('icon-bg', '#f3e8fd')
@section('icon-color', '#9333ea')
@section('badge-bg', '#f3e8fd')
@section('badge-color', '#9333ea')

@section('status-icon')
<!-- star icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:32px; height:32px; fill:currentColor; vertical-align: middle;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/></svg>
@endsection

@section('badge-label', 'Visita completada')
@section('status-title', '¿Cómo estuvo tu visita?')

@section('extra-status')
    @if(!empty($settings['review_url']))
    <div style="margin: 16px 0; text-align: center;">
        <a href="{{ $settings['review_url'] }}" style="text-decoration: none;">
            @for($i=0; $i<5; $i++)
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:40px; height:40px; fill:#fbbc04; margin: 0 4px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/></svg>
            @endfor
        </a>
    </div>
    @endif
@endsection

@section('actions')
    @if(!empty($settings['review_url']))
    <a href="{{ $settings['review_url'] }}" class="btn btn-primary" style="display: inline-block; padding: 10px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; text-decoration: none; margin: 4px; border: 1px solid #1a73e8; color: #ffffff; background-color: #1a73e8;">Dejar una reseña</a>
    @endif
@endsection
