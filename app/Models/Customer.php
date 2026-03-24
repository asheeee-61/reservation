<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'phone'];

    protected $appends = ['total_reservations', 'last_visit'];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function getTotalReservationsAttribute()
    {
        return $this->reservations()->count();
    }

    public function getLastVisitAttribute()
    {
        return $this->reservations()
                    ->orderByDesc('date')
                    ->value('date');
    }
}
