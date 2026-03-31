<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservationActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'description',
        'type',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}
