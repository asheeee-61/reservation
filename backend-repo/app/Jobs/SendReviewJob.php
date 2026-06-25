<?php

namespace App\Jobs;

use App\Models\Reservation;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class SendReviewJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300];

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
        $shouldNotify = false;

        // Pessimistic lock prevents two concurrent executions from both seeing sent_at = null
        DB::transaction(function () use (&$shouldNotify) {
            $reservation = Reservation::lockForUpdate()->find($this->reservation->id);

            if ($reservation
                && $reservation->status === Reservation::STATUS_ASISTIO
                && is_null($reservation->review_sent_at)
            ) {
                $reservation->update(['review_sent_at' => now()]);
                $this->reservation = $reservation;
                $shouldNotify = true;
            }
        });

        if ($shouldNotify) {
            $notificationService->notify('review', $this->reservation);
        }
    }
}
