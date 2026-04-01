<?php

namespace App\Mail;

use App\Models\Reservation;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationReceived extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;

    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    public function envelope(): Envelope
    {
        $name = Setting::first()?->business_name ?? config('app.name', 'Business');
        return new Envelope(
            subject: 'Solicitud de Reserva Recibida - ' . $name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.received',
        );
    }
}
