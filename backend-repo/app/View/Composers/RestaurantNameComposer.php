<?php

namespace App\View\Composers;

use App\Models\Setting;
use Illuminate\View\View;

class RestaurantNameComposer
{
    public function compose(View $view): void
    {
        $setting = Setting::first();
        $businessName = $setting?->business_name
            ?? config('app.name', 'Business');

        $view->with('businessName', $businessName);
    }
}
