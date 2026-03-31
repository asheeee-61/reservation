<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DayStatus extends Model
{
    use HasFactory;

    protected $fillable = ['date', 'status', 'reason'];

    const STATUS_ABIERTO = 'ABIERTO';
    const STATUS_CERRADO = 'CERRADO';
    const STATUS_BLOQUEADO = 'BLOQUEADO';
}
