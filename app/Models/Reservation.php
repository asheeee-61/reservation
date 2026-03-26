<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    const STATUS_PENDIENTE   = 'PENDIENTE';
    const STATUS_CONFIRMADA  = 'CONFIRMADA';
    const STATUS_ASISTIO     = 'ASISTIÓ';
    const STATUS_NO_ASISTIO  = 'NO_ASISTIÓ';

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
