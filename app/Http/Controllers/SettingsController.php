<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function index()
    {
        $defaultConfig = [
            'maxGuests' => 10,
            'minGuests' => 1,
            'restaurant' => [
                'name' => 'Hotaru Madrid',
                'address' => 'Calle de Alcalá 99, 28009 Madrid',
                'lat' => 40.4214,
                'lng' => -3.6846
            ],
            'schedule' => [
                'monday' => ['open' => true, 'shifts' => [['id' => 1, 'openingTime' => '13:00', 'closingTime' => '23:30', 'interval' => 30, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]]]],
                'tuesday' => ['open' => true, 'shifts' => [['id' => 1, 'openingTime' => '13:00', 'closingTime' => '23:30', 'interval' => 30, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]]]],
                'wednesday' => ['open' => true, 'shifts' => [['id' => 1, 'openingTime' => '13:00', 'closingTime' => '23:30', 'interval' => 30, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]]]],
                'thursday' => ['open' => true, 'shifts' => [['id' => 1, 'openingTime' => '13:00', 'closingTime' => '23:30', 'interval' => 30, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]]]],
                'friday' => ['open' => true, 'shifts' => [['id' => 1, 'openingTime' => '13:00', 'closingTime' => '23:30', 'interval' => 30, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]]]],
                'saturday' => ['open' => true, 'shifts' => [['id' => 1, 'openingTime' => '13:00', 'closingTime' => '23:30', 'interval' => 30, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]]]],
                'sunday' => ['open' => true, 'shifts' => [['id' => 1, 'openingTime' => '13:00', 'closingTime' => '23:30', 'interval' => 30, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]]]],
            ],
            'blockedDays' => [],
            'capacity' => []
        ];

        $savedConfig = \Illuminate\Support\Facades\Cache::rememberForever('config.json', function() {
            return Storage::exists('config.json') 
                ? (json_decode(Storage::get('config.json'), true) ?? []) 
                : [];
        });

        $setting = Setting::firstOrCreate(
            [],
            [
                'global_opening_time' => '09:00:00',
                'global_closing_time' => '00:00:00',
                'default_interval' => 30
            ]
        );

        return response()->json(array_merge($defaultConfig, $savedConfig, [
            'global_opening_time' => substr($setting->global_opening_time, 0, 5),
            'global_closing_time' => substr($setting->global_closing_time, 0, 5),
            'default_interval' => $setting->default_interval,
            'whatsapp_phone' => $setting->whatsapp_phone,
            'instagram_username' => $setting->instagram_username,
            'restaurant_phone' => $setting->restaurant_phone,
            'review_link' => $setting->review_link
        ]));
    }

    public function updateConfig(Request $request)
    {
        if ($request->has('global_opening_time') && $request->has('global_closing_time') && $request->has('default_interval')) {
            $request->validate([
                'global_opening_time' => 'required|date_format:H:i',
                'global_closing_time' => 'required|date_format:H:i',
                'default_interval'    => 'required|integer|in:15,30,45,60,90,120',
                'whatsapp_phone'      => 'nullable|string|max:20',
                'instagram_username'  => 'nullable|string|max:100',
                'restaurant_phone'    => 'nullable|string|max:20',
                'review_link'         => 'nullable|string|max:500',
            ]);

            $setting = Setting::firstOrCreate([], [
                'global_opening_time' => '09:00:00',
                'global_closing_time' => '00:00:00',
                'default_interval' => 30
            ]);
            
            $setting->global_opening_time = $request->global_opening_time . ':00';
            $setting->global_closing_time = $request->global_closing_time . ':00';
            $setting->default_interval = $request->default_interval;
            $setting->whatsapp_phone = $request->whatsapp_phone;
            $setting->instagram_username = $request->instagram_username;
            $setting->restaurant_phone = $request->restaurant_phone;
            $setting->review_link = $request->review_link;
            $setting->save();
        }

        $configData = $request->except(['global_opening_time', 'global_closing_time', 'default_interval']);
        Storage::put('config.json', json_encode($configData, JSON_PRETTY_PRINT));
        \Illuminate\Support\Facades\Cache::forget('config.json');

        return response()->json(['success' => true]);
    }

    public function blockedDates(Request $request)
    {
        $perPage = max(1, (int) $request->query('per_page', 10));
        $page    = max(1, (int) $request->query('page', 1));

        $config = \Illuminate\Support\Facades\Cache::rememberForever('config.json', function() {
            return Storage::exists('config.json') ? (json_decode(Storage::get('config.json'), true) ?? []) : [];
        });
        $all = $config['blockedDays'] ?? [];

        sort($all); // ensure ascending chronological order

        $total     = count($all);
        $lastPage  = max(1, (int) ceil($total / $perPage));
        $safePage  = min($page, $lastPage);
        $items     = array_slice($all, ($safePage - 1) * $perPage, $perPage);

        return response()->json([
            'data' => array_values($items),
            'meta' => [
                'total'        => $total,
                'per_page'     => $perPage,
                'current_page' => $safePage,
                'last_page'    => $lastPage,
            ],
        ]);
    }
}
