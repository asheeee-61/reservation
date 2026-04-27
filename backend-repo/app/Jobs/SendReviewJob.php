<?php

namespace App\Jobs;

use App\Models\Reservation;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendReviewJob implements ShouldQueue
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
        // Refresh reservation
        $this->reservation->refresh();

        // Check if still ASISTIO and haven't sent the review yet
        if ($this->reservation->status === Reservation::STATUS_ASISTIO && is_null($this->reservation->review_sent_at)) {
            $notificationService->notify('review', $this->reservation);
            $this->reservation->update(['review_sent_at' => now()]);
        }
    }
}
