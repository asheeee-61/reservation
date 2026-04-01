<?php

namespace App\Mail;

use App\Models\Reservation;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;

    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    public function envelope(): Envelope
    {
        $name = Setting::first()?->restaurant_name ?? config('app.restaurant_name', 'Hotaru Madrid');
        return new Envelope(
            subject: 'Reserva CONFIRMADA - ' . $name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.confirmed',
        );
    }
}
