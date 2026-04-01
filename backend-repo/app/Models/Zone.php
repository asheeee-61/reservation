<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    protected $fillable = [
        'name', 
        'description', 
        'is_active',
        'sort_order'
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
