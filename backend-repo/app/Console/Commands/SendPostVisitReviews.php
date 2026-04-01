<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;

class SendPostVisitReviews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:send-reviews';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends WhatsApp review requests to customers who arrived (asistió)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();
        $notificationService = app(\App\Services\NotificationService::class);

        $reservations = Reservation::with('customer')
            ->where('status', Reservation::STATUS_ASISTIO)
            ->whereNull('review_sent_at')
            ->get();

        foreach ($reservations as $res) {
            /** @var Reservation $res */
            $resDateTime = \Carbon\Carbon::parse($res->date . ' ' . $res->time);
            $settings = \App\Models\Setting::first();
            $notificationSettings = $settings ? $settings->notification_settings : null;
            $hours = $notificationSettings['whatsapp']['review']['hours'] ?? 2;
            
            // Send review X hours after the reservation time
            if ($resDateTime->addHours($hours)->isPast()) {
                $notificationService->notify('review', $res);
                $res->update(['review_sent_at' => now()]);
                $this->info("Review request sent for reservation #{$res->reservation_id}");
            }
        }
    }
}
