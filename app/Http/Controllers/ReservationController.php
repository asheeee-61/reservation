<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    // Admin: Get all reservations
    public function index(Request $request)
    {
        // We will remove pagination for now and return all to avoid breaking React unless we implement pagination
        $query = Reservation::with('customer')->orderBy('date', 'asc')->get();
        return response()->json($query);
    }

    // Customer: Get available slots dynamically
    public function availableSlots(Request $request)
    {
        $date = $request->query('date');
        $guests = (int) $request->query('guests', 1);

        if (!$date) {
            return response()->json([]);
        }

        $defaultConfig = [
            'totalCapacity' => 40,
            'schedule' => [
                'monday' => ['open' => true, 'slots' => ["18:00"=>true, "18:30"=>true, "19:00"=>true, "19:30"=>true, "20:00"=>true, "20:30"=>true]],
                'tuesday' => ['open' => true, 'slots' => ["18:00"=>true, "18:30"=>true, "19:00"=>true, "19:30"=>true, "20:00"=>true, "20:30"=>true]],
                'wednesday' => ['open' => true, 'slots' => ["18:00"=>true, "18:30"=>true, "19:00"=>true, "19:30"=>true, "20:00"=>true, "20:30"=>true]],
                'thursday' => ['open' => true, 'slots' => ["18:00"=>true, "18:30"=>true, "19:00"=>true, "19:30"=>true, "20:00"=>true, "20:30"=>true]],
                'friday' => ['open' => true, 'slots' => ["18:00"=>true, "18:30"=>true, "19:00"=>true, "19:30"=>true, "20:00"=>true, "20:30"=>true]],
                'saturday' => ['open' => true, 'slots' => ["18:00"=>true, "18:30"=>true, "19:00"=>true, "19:30"=>true, "20:00"=>true, "20:30"=>true]],
                'sunday' => ['open' => true, 'slots' => ["18:00"=>true, "18:30"=>true, "19:00"=>true, "19:30"=>true, "20:00"=>true, "20:30"=>true]],
            ],
            'blockedDays' => []
        ];

        if (!\Illuminate\Support\Facades\Storage::exists('config.json')) {
            $config = $defaultConfig;
        } else {
            $savedConfig = json_decode(\Illuminate\Support\Facades\Storage::get('config.json'), true);
            $config = array_merge($defaultConfig, $savedConfig);
        }
        
        $dayOfWeek = strtolower(date('l', strtotime($date)));
        $dayConfig = $config['schedule'][$dayOfWeek] ?? ['open' => false, 'slots' => []];

        if (!$dayConfig['open'] || collect($config['blockedDays'] ?? [])->contains($date)) {
            return response()->json([]);
        }

        $totalCapacity = $config['totalCapacity'] ?? 40;

        $reservedGuestsForSlots = \App\Models\Reservation::where('date', $date)
            ->whereIn('status', ['confirmed', 'pending'])
            ->selectRaw('time, SUM(guests) as total_guests')
            ->groupBy('time')
            ->pluck('total_guests', 'time');

        $masterSlots = [];
        if (isset($dayConfig['shifts']) && is_array($dayConfig['shifts'])) {
            foreach ($dayConfig['shifts'] as $shift) {
                if (isset($shift['slots']) && is_array($shift['slots'])) {
                    foreach ($shift['slots'] as $time => $isOpen) {
                        $masterSlots[$time] = $isOpen;
                    }
                }
            }
        } elseif (isset($dayConfig['slots']) && is_array($dayConfig['slots'])) {
            $masterSlots = $dayConfig['slots'];
        }

        $availableSlots = [];
        if (!empty($masterSlots)) {
            $slotDefinitions = array_keys($masterSlots);
            sort($slotDefinitions);
            
            foreach ($slotDefinitions as $time) {
                if ($masterSlots[$time] === true) {
                    $booked = (int) $reservedGuestsForSlots->get($time, 0);
                    $remaining = $totalCapacity - $booked;
                    
                    $availableSlots[] = [
                        'time' => $time,
                        'available' => $remaining >= $guests
                    ];
                }
            }
        }

        return response()->json($availableSlots);
    }

    // Customer: Submit a new reservation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'slot.time' => 'required|string',
            'guests' => 'required|integer|min:1',
            'user.name' => 'required|string|max:255',
            'user.email' => 'nullable|email|max:255',
            'user.phone' => 'nullable|string|max:20',
            'user.specialRequests' => 'nullable|string'
        ]);

        $resId = '#' . rand(1000, 9999);

        // Find or create customer
        $email = $validated['user']['email'] ?? null;
        $phone = $validated['user']['phone'] ?? null;
        $name = $validated['user']['name'];
        $customer = null;

        if ($email) {
            $customer = Customer::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'phone' => $phone]
            );
        } elseif ($phone) {
            $customer = Customer::firstOrCreate(
                ['phone' => $phone],
                ['name' => $name, 'email' => null]
            );
        } else {
            $customer = Customer::create([
                'name' => $name,
                'email' => null,
                'phone' => null
            ]);
        }

        $reservation = Reservation::create([
            'reservation_id' => $resId,
            'customer_id' => $customer->id,
            'date' => $validated['date'],
            'time' => $validated['slot']['time'],
            'guests' => $validated['guests'],
            'special_requests' => $validated['user']['specialRequests'] ?? null,
            'status' => 'confirmed'
        ]);

        // Simulated WhatsApp logging as requested by user
        if (!empty($validated['user']['phone'])) {
            Log::info("WHATSAPP NOTIFICATION: Booking $resId confirmed for {$validated['user']['phone']}. Will be implemented later.");
        }

        return response()->json([
            'success' => true,
            'reservationId' => $resId,
            'data' => $reservation->load('customer')
        ], 201);
    }

    // Admin: Full update of reservation details
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required|string',
            'guests' => 'required|integer|min:1',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'special_requests' => 'nullable|string',
            'status' => 'required|in:pending,confirmed,cancelled,no_show'
        ]);

        $reservation = Reservation::findOrFail($id);
        
        $email = $validated['email'] ?? null;
        $phone = $validated['phone'] ?? null;
        $name = $validated['name'];
        $customer = null;

        if ($email) {
            $customer = Customer::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'phone' => $phone]
            );
        } elseif ($phone) {
            $customer = Customer::firstOrCreate(
                ['phone' => $phone],
                ['name' => $name, 'email' => null]
            );
        } else {
            $customer = Customer::create([
                'name' => $name,
                'email' => null,
                'phone' => null
            ]);
        }

        $reservation->update([
            'customer_id' => $customer->id,
            'date' => $validated['date'],
            'time' => $validated['time'],
            'guests' => $validated['guests'],
            'special_requests' => $validated['special_requests'],
            'status' => $validated['status']
        ]);

        return response()->json([
            'success' => true,
            'data' => $reservation->load('customer')
        ]);
    }

    // Admin: Update status only (quick action)
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,confirmed,cancelled,no_show']);
        
        $reservation = Reservation::findOrFail($id);
        $reservation->status = $request->status;
        $reservation->save();

        return response()->json(['success' => true, 'data' => $reservation]);
    }
}
