<?php

namespace App\View\Composers;

use App\Models\Setting;
use Illuminate\View\View;

class RestaurantNameComposer
{
    public function compose(View $view): void
    {
        $setting = Setting::first();
        $restaurantName = $setting?->restaurant_name
            ?? config('app.restaurant_name', 'Hotaru Madrid');

        $view->with('restaurantName', $restaurantName);
    }
}
