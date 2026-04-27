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

