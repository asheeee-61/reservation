<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReservationReceived;
use App\Mail\ReservationConfirmed;
use App\Mail\ReservationCancelled;
use App\Mail\ReservationReminder;
use App\Mail\PostVisitReview;

class NotificationService
{
    /**
     * Notify customer via WhatsApp and Email.
     * Channels are independent; one failure won't block the other.
     */
    public function notify(string $type, Reservation $reservation): void
    {
        $reservation->load(['customer', 'zone', 'event']);

        if (!$reservation->customer) {
            Log::warning("Notification failed: No customer for reservation {$reservation->reservation_id}");
            return;
        }

        // WhatsApp Channel
        if ($reservation->customer->phone) {
            $this->sendWhatsApp($type, $reservation);
        }

        // Email Channel
        if ($reservation->customer->email) {
            $this->sendEmail($type, $reservation);
        }
    }

    protected function sendWhatsApp(string $type, Reservation $reservation): void
    {
        try {
            $noticeUrl = config('notice.url');
            if (!$noticeUrl) return;

            $endpoint = match($type) {
                'received'  => '/notify/new-reservation',
                'confirmed' => '/notify/confirmed',
                'cancelled' => '/notify/cancellation',
                'reminder_2h' => '/notify/reminder-2h',
                'review'    => '/notify/review',
                default     => null
            };

            if (!$endpoint) return;

            $payload = $this->getWhatsAppPayload($type, $reservation);

            Http::timeout(5)
                ->withHeaders(['x-api-secret' => config('notice.secret')])
                ->post("{$noticeUrl}{$endpoint}", $payload);

            Log::info("WhatsApp ($type) sent to {$reservation->customer->phone}");
        } catch (\Exception $e) {
            Log::warning("WhatsApp notification failed ($type): " . $e->getMessage());
        }
    }

    protected function sendEmail(string $type, Reservation $reservation): void
    {
        try {
            $mailable = match($type) {
                'received'  => new ReservationReceived($reservation),
                'confirmed' => new ReservationConfirmed($reservation),
                'cancelled' => new ReservationCancelled($reservation),
                'reminder_2h' => new ReservationReminder($reservation),
                'review'    => new PostVisitReview($reservation),
                default     => null
            };

            if (!$mailable) return;

            Mail::to($reservation->customer->email)->send($mailable);

            Log::info("Email ($type) sent to {$reservation->customer->email}");
        } catch (\Exception $e) {
            Log::warning("Email notification failed ($type): " . $e->getMessage());
        }
    }

    protected function getWhatsAppPayload(string $type, Reservation $reservation): array
    {
        $base = [
            'customer' => [
                'name'  => $reservation->customer->name,
                'phone' => $reservation->customer->phone,
            ]
        ];

        $settings = Setting::first();
        $adminPhone = $settings->restaurant_phone ?? config('notice.admin_phone');
        $reviewLink = $settings->review_link ?? config('notice.review_link', 'https://g.page/r/YOUR_RESTAURANT_ID/review');
        $restaurantName = $settings->restaurant_name ?? config('app.restaurant_name', 'Hotaru Madrid');

        return match($type) {
            'received' => array_merge($base, [
                'reservation' => [
                    'id'     => $reservation->reservation_id,
                    'date'   => $reservation->date,
                    'time'   => $reservation->time,
                    'guests' => $reservation->guests,
                ],
                'zone'           => $reservation->zone ? ['name' => $reservation->zone->name] : null,
                'event'          => $reservation->event ? ['name' => $reservation->event->name] : null,
                'adminPhone'     => $adminPhone,
                'restaurantName' => $restaurantName,
            ]),
            'confirmed' => array_merge($base, [
                'reservation' => [
                    'id'     => $reservation->reservation_id,
                    'date'   => $reservation->date,
                    'time'   => $reservation->time,
                    'guests' => $reservation->guests,
                ],
                'restaurantName' => $restaurantName,
            ]),
            'cancelled' => array_merge($base, [
                'reason'         => $reservation->cancellation_reason,
                'restaurantName' => $restaurantName,
            ]),
            'reminder_2h' => array_merge($base, [
                'reservation' => [
                    'date' => $reservation->date,
                    'time' => $reservation->time,
                ],
                'restaurantName' => $restaurantName,
            ]),
            'review' => array_merge($base, [
                'reviewLink'     => $reviewLink,
                'restaurantName' => $restaurantName,
            ]),
            default => $base
        };
    }
}
