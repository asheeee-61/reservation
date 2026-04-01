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

        $menuPdfUrl = $setting->menu_pdf
            ? asset('storage/' . $setting->menu_pdf)
            : null;

        $logoUrl = $setting->logo
            ? asset('storage/' . $setting->logo)
            : null;

        $dayStatuses = \App\Models\DayStatus::where('status', '!=', \App\Models\DayStatus::STATUS_ABIERTO)
            ->get()
            ->keyBy('date');

        return response()->json(array_merge($defaultConfig, $savedConfig, [
            'global_opening_time' => substr($setting->global_opening_time, 0, 5),
            'global_closing_time' => substr($setting->global_closing_time, 0, 5),
            'default_interval' => $setting->default_interval,
            'whatsapp_phone' => $setting->whatsapp_phone,
            'instagram_username' => $setting->instagram_username,
            'restaurant_phone' => $setting->restaurant_phone,
            'review_link' => $setting->review_link,
            'google_maps_link' => $setting->google_maps_link,
            'menu_pdf_url' => $menuPdfUrl,
            'reservation_link' => $setting->reservation_link,
            'logo_url' => $logoUrl,
            'restaurant_name' => $setting->restaurant_name,
            'dayStatuses' => $dayStatuses
        ]));
    }

    public function updateConfig(Request $request)
    {
        $request->validate([
            'global_opening_time' => 'nullable|date_format:H:i',
            'global_closing_time' => 'nullable|date_format:H:i',
            'default_interval'    => 'nullable|integer|in:15,30,45,60,90,120',
            'whatsapp_phone'      => 'nullable|string|max:20',
            'instagram_username'  => 'nullable|string|max:100',
            'restaurant_phone'    => 'nullable|string|max:20',
            'review_link'         => 'nullable|string|max:500',
            'google_maps_link'    => 'nullable|string|max:500',
            'reservation_link'    => 'nullable|string|max:500',
            'menu_pdf'            => 'nullable|file|mimes:pdf|max:51200',
            'logo'                => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $setting = Setting::firstOrCreate([], [
            'global_opening_time' => '09:00:00',
            'global_closing_time' => '00:00:00',
            'default_interval' => 30
        ]);

        if ($request->has('global_opening_time')) $setting->global_opening_time = $request->global_opening_time . ':00';
        if ($request->has('global_closing_time')) $setting->global_closing_time = $request->global_closing_time . ':00';
        if ($request->has('default_interval')) $setting->default_interval = $request->default_interval;
        if ($request->has('restaurant_name')) $setting->restaurant_name = $request->restaurant_name;
        if ($request->has('whatsapp_phone')) $setting->whatsapp_phone = $request->whatsapp_phone;
        if ($request->has('instagram_username')) $setting->instagram_username = $request->instagram_username;
        if ($request->has('restaurant_phone')) $setting->restaurant_phone = $request->restaurant_phone;
        if ($request->has('review_link')) $setting->review_link = $request->review_link;
        if ($request->has('google_maps_link')) $setting->google_maps_link = $request->google_maps_link;
        if ($request->has('reservation_link')) $setting->reservation_link = $request->reservation_link;

        if ($request->hasFile('menu_pdf')) {
            if ($setting->menu_pdf && Storage::disk('public')->exists($setting->menu_pdf)) {
                Storage::disk('public')->delete($setting->menu_pdf);
            }
            $path = $request->file('menu_pdf')->store('menus', 'public');
            $setting->menu_pdf = $path;
        }

        if ($request->hasFile('logo')) {
            if ($setting->logo && Storage::disk('public')->exists($setting->logo)) {
                Storage::disk('public')->delete($setting->logo);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $setting->logo = $path;
        }

        $setting->save();

        // Handle additional config fields stored in config.json
        $configKeys = ['global_opening_time', 'global_closing_time', 'default_interval', 'menu_pdf', 'logo',
            'restaurant_name', 'whatsapp_phone', 'instagram_username', 'restaurant_phone',
            'review_link', 'google_maps_link', 'reservation_link'];
        
        $currentConfig = Storage::exists('config.json') ? json_decode(Storage::get('config.json'), true) : [];
        $newData = $request->except($configKeys);
        
        $updatedConfig = array_merge($currentConfig, $newData);
        Storage::put('config.json', json_encode($updatedConfig, JSON_PRETTY_PRINT));
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
