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
        $shouldNotify = false;

        // Pessimistic lock prevents two concurrent executions from both seeing sent_at = null
        DB::transaction(function () use (&$shouldNotify) {
            $reservation = Reservation::lockForUpdate()->find($this->reservation->id);

            if ($reservation
                && $reservation->status === Reservation::STATUS_CONFIRMADA
                && is_null($reservation->reminder_2h_sent_at)
            ) {
                $reservation->update(['reminder_2h_sent_at' => now()]);
                $this->reservation = $reservation;
                $shouldNotify = true;
            }
        });

        if ($shouldNotify) {
            $notificationService->notify('reminder_2h', $this->reservation);
        }
    }
}
