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
            'business' => [
                'name' => 'Hechizo Hookah Lounge',
                'address' => 'Cam. de los Romanos, 91, 30820 Alcantarilla, Murcia, Spain',
                'lat' => 37.964344931555196,
                'lng' => -1.2175485087252154
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
            'blockedDays' => []
        ];

        $savedConfig = \Illuminate\Support\Facades\Cache::rememberForever('config.json', function() {
            return Storage::exists('config.json') 
                ? (json_decode(Storage::get('config.json'), true) ?? []) 
                : [];
        });

        $setting = Setting::firstOrCreate(
            [],
            [
                'business_name' => 'Hechizo Hookah Lounge',
                'global_opening_time' => '09:00:00',
                'global_closing_time' => '00:00:00',
                'default_interval' => 30,
                'google_maps_link' => 'https://www.google.com/maps?q=37.964344931555196,-1.2175485087252154'
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
            'business_phone' => $setting->business_phone,
            'review_link' => $setting->review_link,
            'google_maps_link' => $setting->google_maps_link,
            'menu_pdf_url' => $menuPdfUrl,
            'reservation_link' => $setting->reservation_link,
            'logo_url' => $logoUrl,
            'business_name' => $setting->business_name,
            'address' => $setting->address,
            'business_email' => $setting->business_email,
            'notification_settings' => $setting->notification_settings ?: [
                'email' => [
                    'received' => true,
                    'confirmed' => true,
                    'cancelled' => true,
                    'reminder_2h' => true,
                    'review' => true
                ],
                'whatsapp' => [
                    'received' => true,
                    'confirmed' => true,
                    'cancelled' => true,
                    'reminder_2h' => ['active' => true, 'minutes' => 120],
                    'review' => ['active' => true, 'minutes' => 120]
                ]
            ],
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
            'business_phone'      => 'nullable|string|max:20',
            'review_link'         => 'nullable|string|max:500',
            'google_maps_link'    => 'nullable|string|max:500',
            'reservation_link'    => 'nullable|string|max:500',
            'address'             => 'nullable|string|max:500',
            'business_email'      => 'nullable|email|max:255',
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
        if ($request->has('business_name')) $setting->business_name = $request->business_name;
        if ($request->has('address')) $setting->address = $request->address;
        if ($request->has('business_email')) $setting->business_email = $request->business_email;
        if ($request->has('whatsapp_phone')) $setting->whatsapp_phone = $request->whatsapp_phone;
        if ($request->has('instagram_username')) $setting->instagram_username = $request->instagram_username;
        if ($request->has('business_phone')) $setting->business_phone = $request->business_phone;
        if ($request->has('review_link')) $setting->review_link = $request->review_link;
        if ($request->has('google_maps_link')) $setting->google_maps_link = $request->google_maps_link;
        if ($request->has('reservation_link')) $setting->reservation_link = $request->reservation_link;
        if ($request->has('notification_settings')) $setting->notification_settings = $request->notification_settings;

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
            'business_name', 'address', 'business_email', 'whatsapp_phone', 'instagram_username', 'business_phone',
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

    public function previewTemplate(Request $request, $type)
    {
        $reservation = \App\Models\Reservation::latest()->first() ?: new \App\Models\Reservation([
            'reservation_id' => 'PREVIEW123',
            'date' => date('Y-m-d'),
            'time' => '20:00',
            'guests' => 2,
        ]);
        
        $setting = Setting::first();
        $settings = $setting ? $setting->toArray() : [];

        $mailable = match($type) {
            'received'  => new \App\Mail\ReservationReceived($reservation, $settings),
            'confirmed' => new \App\Mail\ReservationConfirmed($reservation, $settings),
            'cancelled' => new \App\Mail\ReservationCancelled($reservation, $settings),
            'reminder_2h' => new \App\Mail\ReservationReminder($reservation, $settings),
            'review'    => new \App\Mail\PostVisitReview($reservation, $settings),
            default     => null
        };

        if (!$mailable) return response()->json(['error' => 'Invalid template type'], 400);

        return $mailable->render();
    }

    public function previewWhatsAppTemplate(Request $request, $type)
    {
        $setting = Setting::first();
        $businessName = $setting ? $setting->business_name : 'Hechizo Hookah Lounge';
        $reviewLink = $setting ? ($setting->review_link ?: 'https://g.page/review') : 'https://g.page/review';

        $data = [
            'id' => '123',
            'customerName' => 'Juan Pérez',
            'customerPhone' => '+34 600 000 000',
            'date' => date('Y-m-d'),
            'time' => '21:00',
            'guests' => 4,
            'tableType' => 'Terraza',
            'specialEvent' => 'Cumpleaños',
            'businessName' => $businessName,
            'reviewLink' => $reviewLink
        ];

        $message = match($type) {
            'received' => "SOLICITUD DE RESERVA RECIBIDA - {$data['businessName']}\n\nEstimado/a {$data['customerName']}, hemos recibido su solicitud.\n\nDetalles:\n- Fecha: {$data['date']}\n- Hora: {$data['time']}\n- Personas: {$data['guests']}\n- Zona: {$data['tableType']}\n- Evento: {$data['specialEvent']}\n- Referencia: #{$data['id']}\n\nLe confirmaremos en breve. Muchas gracias.",
            'confirmed' => "Estimado/a {$data['customerName']}, le informamos que su reserva #{$data['id']} en {$data['businessName']} ha sido CONFIRMADA. Le esperamos.",
            'cancelled' => "Estimado/a {$data['customerName']}, le informamos que su reserva #{$data['id']} en {$data['businessName']} ha sido cancelada. Lamentamos las molestias.",
            'reminder_2h' => "Estimado/a {$data['customerName']}, le recordamos su reserva #{$data['id']} en {$data['businessName']} para hoy a las {$data['time']}. Le esperamos.",
            'review' => "Estimado/a {$data['customerName']}, gracias por visitarnos en {$data['businessName']}. Enlace para su opinión: {$data['reviewLink']}",
            default => null
        };

        if (!$message) return response()->json(['error' => 'Invalid template type'], 400);

        return response()->json(['message' => $message]);
    }

    public function notificationLogs(Request $request)
    {
        $date = $request->input('date', now()->toDateString());

        $query = \App\Models\NotificationLog::with('reservation.customer')
            ->whereDate('created_at', $date)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        $limit = min((int) $request->input('limit', 500), 500);
        $logs = $query->take($limit)->get();

        $base = \App\Models\NotificationLog::whereDate('created_at', $date);

        $stats = [
            'sent'      => (clone $base)->where('status', 'sent')->count(),
            'failed'    => (clone $base)->where('status', 'failed')->count(),
            'invalid'   => (clone $base)->where('status', 'invalid')->count(),
            'lastCheck' => now()->format('H:i:s d/m/Y'),
            'date'      => $date,
        ];

        return response()->json([
            'logs'  => $logs,
            'stats' => $stats
        ]);
    }

    public function retryNotification(Request $request, $id)
    {
        $log = \App\Models\NotificationLog::with('reservation.customer.zone', 'reservation.event')->findOrFail($id);

        if (!$log->reservation) {
            return response()->json(['error' => 'Reserva no encontrada'], 404);
        }

        $service = app(\App\Services\NotificationService::class);

        try {
            $service->retryChannel($log->channel, $log->template, $log->reservation);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
