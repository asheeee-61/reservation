<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'restaurant_name',
        'global_opening_time',
        'global_closing_time',
        'default_interval',
        'whatsapp_phone',
        'instagram_username',
        'restaurant_phone',
        'review_link',
        'google_maps_link',
        'menu_pdf',
        'reservation_link',
        'logo',
    ];
}
