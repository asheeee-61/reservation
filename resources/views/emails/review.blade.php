@extends('emails.layout')

@section('content')
    <h2>¡Gracias por visitarnos, {{ $reservation->customer->name }}!</h2>
    <p>Esperamos que haya tenido una experiencia excelente en {{ config('app.restaurant_name', 'Nuestro Restaurante') }}.</p>
    
    <p>Nos encantaría conocer su opinión. Su valoración nos ayuda a seguir mejorando y a ofrecer el mejor servicio a nuestros clientes.</p>
    
    <div style="text-align: center; margin-top: 40px;">
        <a href="{{ config('notice.review_link', 'https://g.page/r/YOUR_RESTAURANT_ID/review') }}" class="button">VALORAR EXPERIENCIA</a>
    </div>

    <p>¡Esperamos verle pronto de nuevo!</p>
@endsection
