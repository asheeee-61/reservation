@extends('emails.reservations.layout')

@section('title', '¿Cómo estuvo tu visita? – ' . ($settings['business_name'] ?? 'Hechizo'))

@section('status-title', '¿Cómo estuvo tu visita?')

@section('sub-text')
    Hola {{ $cName }}, gracias por visitarnos. Tu opinión nos ayuda a seguir mejorando.
@endsection

@section('extra')
    @if(!empty($settings['google_maps_link']))
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:36px;">
        <tr>
            <td align="center">
                <a href="{{ $settings['google_maps_link'] }}"
                   style="display:inline-block; padding:12px 32px; background-color:#c4a048; color:#0e1a0f; text-decoration:none; font-family:Arial,sans-serif; font-size:13px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">
                    Dejar una reseña
                </a>
            </td>
        </tr>
    </table>
    @endif
@endsection
