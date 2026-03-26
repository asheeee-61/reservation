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
                'monday' => ['open' => true, 'shifts' => []],
                'tuesday' => ['open' => true, 'shifts' => []],
                'wednesday' => ['open' => true, 'shifts' => []],
                'thursday' => ['open' => true, 'shifts' => []],
                'friday' => ['open' => true, 'shifts' => []],
                'saturday' => ['open' => true, 'shifts' => []],
                'sunday' => ['open' => true, 'shifts' => []],
            ],
            'blockedDays' => [],
            'capacity' => []
        ];

        $savedConfig = [];
        if (Storage::exists('config.json')) {
            $savedConfig = json_decode(Storage::get('config.json'), true) ?? [];
        }

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
            'instagram_username' => $setting->instagram_username
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
            $setting->save();
        }

        $configData = $request->except(['global_opening_time', 'global_closing_time', 'default_interval']);
        Storage::put('config.json', json_encode($configData, JSON_PRETTY_PRINT));

        return response()->json(['success' => true]);
    }
}
