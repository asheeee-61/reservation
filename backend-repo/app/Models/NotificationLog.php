<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'reservation_id',
        'channel',
        'template',
        'recipient',
        'body',
        'status',
        'error_message'
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
