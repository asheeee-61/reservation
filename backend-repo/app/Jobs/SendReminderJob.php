<?php

namespace App\Jobs;

use App\Models\Reservation;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $reservation;

    /**
     * Create a new job instance.
     */
    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    /**
     * Execute the job.
     */
    public function handle(NotificationService $notificationService): void
    {
        // Refresh reservation to get latest status
        $this->reservation->refresh();

        // Check if still CONFIRMADA and haven't sent the reminder yet
        if ($this->reservation->status === Reservation::STATUS_CONFIRMADA && is_null($this->reservation->reminder_2h_sent_at)) {
            $notificationService->notify('reminder_2h', $this->reservation);
            $this->reservation->update(['reminder_2h_sent_at' => now()]);
        }
    }
}
