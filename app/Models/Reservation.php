<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    const STATUS_PENDING   = 'PENDING';
    const STATUS_CONFIRMED = 'CONFIRMED';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_NO_SHOW   = 'NO_SHOW';

    protected $fillable = [
        'reservation_id',
        'customer_id',
        'date',
        'time',
        'guests',
        'special_requests',
        'status',
        'table_type_id',
        'special_event_id',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function tableType()
    {
        return $this->belongsTo(TableType::class);
    }

    public function specialEvent()
    {
        return $this->belongsTo(SpecialEvent::class);
    }
}
