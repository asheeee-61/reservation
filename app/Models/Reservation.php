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
    const STATUS_CANCELADA   = 'CANCELADA';

    const SOURCE_WEB      = 'web';
    const SOURCE_MANUAL   = 'manual';
    const SOURCE_WHATSAPP = 'whatsapp';

    protected $fillable = [
        'reservation_id',
        'customer_id',
        'date',
        'time',
        'guests',
        'special_requests',
        'status',
        'source',
        'table_type_id',
        'special_event_id',
        'reminder_2h_sent_at',
        'review_sent_at',
        'cancellation_reason',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function tableType()
    {
        return $this->belongsTo(TableType::class);
    }

    public function activities()
    {
        return $this->hasMany(ReservationActivity::class)->orderBy('created_at', 'desc');
    }

    public function specialEvent()
    {
        return $this->belongsTo(SpecialEvent::class);
    }
}
