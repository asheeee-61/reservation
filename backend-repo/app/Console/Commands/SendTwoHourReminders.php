<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;

class SendTwoHourReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sends WhatsApp reminders for reservations starting in 2 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();
        $notificationService = app(\App\Services\NotificationService::class);

        $reservations = Reservation::with('customer')
            ->where('status', Reservation::STATUS_CONFIRMADA)
            ->where('date', $now->toDateString())
            ->whereNull('reminder_2h_sent_at')
            ->get();

        foreach ($reservations as $res) {
            /** @var Reservation $res */
            $resDateTime = \Carbon\Carbon::parse($res->date . ' ' . $res->time);
            $settings = \App\Models\Setting::first();
            $notificationSettings = $settings ? $settings->notification_settings : null;
            $hours = $notificationSettings['whatsapp']['reminder_2h']['hours'] ?? 2;
            $mins = $hours * 60;
            
            // Check if within the configured hour window
            if ($resDateTime->isFuture() && $resDateTime->diffInMinutes($now) <= $mins) {
                $notificationService->notify('reminder_2h', $res);
                $res->update(['reminder_2h_sent_at' => now()]);
                $this->info("Reminder sent for reservation #{$res->reservation_id}");
            }
        }
    }
}
