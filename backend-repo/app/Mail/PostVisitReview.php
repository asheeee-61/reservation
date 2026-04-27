<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class PostVisitReview extends Mailable implements ShouldQueue
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
            from: new Address('contacto@hechizohookah.online', config('app.name')),
            replyTo: [new Address('contacto@hechizohookah.online')],
            subject: '¿Cómo estuvo tu visita? - ' . $bName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservations.review',
        );
    }
}
