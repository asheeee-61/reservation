<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'global_opening_time',
        'global_closing_time',
        'default_interval'
    ];
}
