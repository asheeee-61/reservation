<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;
    public array $settings;

    public function __construct(Reservation $reservation, array $settings = [])
    {
        $this->reservation = $reservation;
        $this->settings = $settings;
    }

    public function envelope(): Envelope
    {
        $bName = $this->settings['business_name'] ?? config('app.name', 'Business');
        return new Envelope(
            subject: 'Reservación confirmada - ' . $bName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservations.confirmed',
        );
    }
}
