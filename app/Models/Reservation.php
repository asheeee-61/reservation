<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'customer_id',
        'date',
        'time',
        'guests',
        'special_requests',
        'status',
        'table_type_id',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function tableType()
    {
        return $this->belongsTo(TableType::class);
    }
}
