<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

use Illuminate\Contracts\Queue\ShouldQueue;

class ReservationReminder extends Mailable implements ShouldQueue
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
        $isToday = Carbon::parse($this->reservation->reserved_at)->isToday();
        $title = $isToday ? 'Tu mesa es hoy' : 'Tu mesa es mañana';
        
        return new Envelope(
            subject: $title . ' - ' . $bName,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservations.reminder',
        );
    }
}
