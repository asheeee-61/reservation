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
    public function retryChannel(string $channel, string $type, Reservation $reservation): void
    {
        $reservation->load(['customer', 'zone', 'event']);

        if (!$reservation->customer) {
            throw new \Exception("No hay cliente para la reserva {$reservation->reservation_id}");
        }

        if ($channel === 'whatsapp') {
            if (!$reservation->customer->phone) {
                throw new \Exception('El cliente no tiene número de teléfono');
            }
            $this->sendWhatsApp($type, $reservation);
        } elseif ($channel === 'email') {
            if (!$reservation->customer->email) {
                throw new \Exception('El cliente no tiene email');
            }
            $this->sendEmail($type, $reservation, true);
        } else {
            throw new \Exception("Canal desconocido: $channel");
        }
    }

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
        $target = $reservation->customer->phone;
        try {
            $noticeUrl = config('notice.url');
            if (!$noticeUrl) return;

            $settings = Setting::first();
            $notificationSettings = $settings ? $settings->notification_settings : null;
            
            if ($notificationSettings && isset($notificationSettings['whatsapp'][$type])) {
                $config = $notificationSettings['whatsapp'][$type];
                if (is_array($config)) {
                    if (!($config['active'] ?? true)) return;
                } else if (!$config) {
                    return;
                }
            }

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
            $adminPhone = $payload['adminPhone'] ?? 'N/A';

            $response = Http::timeout(5)
                ->withHeaders(['x-api-secret' => config('notice.secret')])
                ->post("{$noticeUrl}{$endpoint}", $payload);

            if ($response->successful()) {
                \App\Models\NotificationLog::create([
                    'reservation_id' => $reservation->id,
                    'channel' => 'whatsapp',
                    'template' => $type,
                    'recipient' => $target,
                    'status' => 'sent'
                ]);

                $logMsg = "WhatsApp ($type) sent to customer: $target";
                if ($type === 'received') {
                    $logMsg .= " and Admin: $adminPhone";
                }
                Log::info($logMsg);
            } else {
                throw new \Exception("HTTP request failed with status: " . $response->status());
            }
        } catch (\Exception $e) {
            \App\Models\NotificationLog::create([
                'reservation_id' => $reservation->id,
                'channel' => 'whatsapp',
                'template' => $type,
                'recipient' => $target ?? 'unknown',
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
            Log::warning("WhatsApp notification failed ($type): " . $e->getMessage());
        }
    }

    protected function sendEmail(string $type, Reservation $reservation, bool $immediate = false): void
    {
        $target = $reservation->customer->email;
        try {
            $settingsModel = Setting::first();
            $settings = $settingsModel ? $settingsModel->toArray() : [];

            $notificationSettings = $settingsModel ? $settingsModel->notification_settings : null;
            if ($notificationSettings && isset($notificationSettings['email'][$type]) && !$notificationSettings['email'][$type]) {
                return;
            }

            $mailable = match($type) {
                'received'  => new ReservationReceived($reservation, $settings),
                'confirmed' => new ReservationConfirmed($reservation, $settings),
                'cancelled' => new ReservationCancelled($reservation, $settings),
                'reminder_2h' => new ReservationReminder($reservation, $settings),
                'review'    => new PostVisitReview($reservation, $settings),
                default     => null
            };

            if (!$mailable) return;

            if (!$immediate && in_array($type, ['reminder_2h', 'review'])) {
                $minutes = $notificationSettings['whatsapp'][$type]['minutes'] ?? 120;
                $resDateTime = \Carbon\Carbon::parse($reservation->date . ' ' . $reservation->time);
                $delay = $type === 'reminder_2h'
                    ? $resDateTime->subMinutes($minutes)
                    : $resDateTime->addMinutes($minutes);

                if ($delay->isFuture()) {
                    Mail::to($target)->later($delay, $mailable);
                } else {
                    Mail::to($target)->queue($mailable);
                }
            } else {
                Mail::to($target)->queue($mailable);
            }

            \App\Models\NotificationLog::create([
                'reservation_id' => $reservation->id,
                'channel' => 'email',
                'template' => $type,
                'recipient' => $target,
                'status' => 'sent'
            ]);

            Log::info("Email ($type) sent to {$target}");
        } catch (\Exception $e) {
            \App\Models\NotificationLog::create([
                'reservation_id' => $reservation->id,
                'channel' => 'email',
                'template' => $type,
                'recipient' => $target ?? 'unknown',
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
            Log::warning("Email notification failed ($type): " . $e->getMessage());
        }
    }

    protected function getWhatsAppPayload(string $type, Reservation $reservation): array
    {
        $base = [
            'customer' => [
                'name'  => $reservation->customer->name,
                'phone' => $reservation->customer->phone,
            ],
            'id' => $reservation->reservation_id
        ];
    
        $settings = Setting::first();
        $reviewLink = $settings->review_link ?? config('notice.review_link', 'https://g.page/r/YOUR_RESTAURANT_ID/review');
        $businessName = $settings->business_name ?? config('app.name', 'Business');
        $address = $settings->address ?? '';
        $contacts = [
            'phone' => $settings->business_phone,
            'whatsapp' => $settings->whatsapp_phone,
            'instagram' => $settings->instagram_username,
            'email' => $settings->business_email,
        ];
    
        $payload = [
            'businessName' => $businessName,
            'address' => $address,
            'contacts' => array_filter($contacts),
        ];
    
        return match($type) {
            'received' => array_merge($base, $payload, [
                'reservation' => [
                    'id'     => $reservation->reservation_id,
                    'date'   => $reservation->date,
                    'time'   => $reservation->time,
                    'guests' => $reservation->guests,
                ],
                'zone'           => $reservation->zone ? ['name' => $reservation->zone->name] : null,
                'event'          => $reservation->event ? ['name' => $reservation->event->name] : null,
            ]),
            'confirmed' => array_merge($base, $payload, [
                'reservation' => [
                    'id'     => $reservation->reservation_id,
                    'date'   => $reservation->date,
                    'time'   => $reservation->time,
                    'guests' => $reservation->guests,
                ],
            ]),
            'cancelled' => array_merge($base, $payload, [
                'reason'         => $reservation->cancellation_reason,
            ]),
            'reminder_2h' => array_merge($base, $payload, [
                'reservation' => [
                    'date' => $reservation->date,
                    'time' => $reservation->time,
                ],
            ]),
            'review' => array_merge($base, $payload, [
                'reviewLink'     => $reviewLink,
                'googleMapsLink' => $settings->google_maps_link,
            ]),
            default => array_merge($base, $payload)
        };
    }
}
