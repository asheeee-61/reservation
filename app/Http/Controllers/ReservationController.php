<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) ($request->per_page ?? 10);
        $perPage = in_array($perPage, [10, 25, 50]) ? $perPage : 10;

        $query = Reservation::with(['customer', 'tableType', 'specialEvent'])->latest();

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('reservation_id', 'like', $term)
                  ->orWhere('status', 'like', $term)
                  ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', $term));
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        $results = $query->paginate($perPage);

        return response()->json([
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'per_page'     => $results->perPage(),
                'total'        => $results->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $reservation = Reservation::with(['customer', 'tableType', 'specialEvent', 'activities'])->findOrFail($id);
        return response()->json($reservation);
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
            ->whereIn('status', [Reservation::STATUS_CONFIRMADA, Reservation::STATUS_PENDIENTE])
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

    // Customer: Submit a new reservation (always PENDIENTE, source=client)
    public function store(Request $request)
    {
        return $this->createReservation($request, Reservation::STATUS_PENDIENTE, Reservation::SOURCE_CLIENT);
    }

    // Admin: Create a new reservation (always CONFIRMADA, source=admin)
    public function adminStore(Request $request)
    {
        return $this->createReservation($request, Reservation::STATUS_CONFIRMADA, Reservation::SOURCE_ADMIN);
    }

    private function createReservation(Request $request, string $status, string $source)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'slot.time' => 'required|string',
            'guests' => 'required|integer|min:1',
            'customer_id' => 'nullable|exists:customers,id',
            'user.name' => 'required_without:customer_id|string|max:255',
            'user.email' => 'nullable|email|max:255',
            'user.phone' => 'required_without:customer_id|string|max:20',
            'special_requests' => 'nullable|string',
            'table_type_id' => 'required|exists:table_types,id',
            'special_event_id' => 'nullable|exists:special_events,id'
        ]);

        $resId = '#' . rand(1000, 9999);

        if ($request->filled('customer_id')) {
            $customer = Customer::findOrFail($request->customer_id);
        } else {
            $customer = Customer::updateOrCreate(
                ['phone' => $request->user['phone']],
                [
                    'name'  => $request->user['name'],
                    'email' => $request->user['email'] ?? null,
                ]
            );
        }

        $reservation = Reservation::create([
            'reservation_id'   => $resId,
            'customer_id'      => $customer->id,
            'date'             => $validated['date'],
            'time'             => $validated['slot']['time'],
            'guests'           => $validated['guests'],
            'special_requests' => $validated['special_requests'] ?? null,
            'status'           => $status,   // enforced by origin, never from request
            'source'           => $source,   // immutable, set here only
            'table_type_id'    => $validated['table_type_id'],
            'special_event_id' => $validated['special_event_id'] ?? null,
        ]);

        if (!empty($validated['user']['phone'])) {
            Log::info("WHATSAPP NOTIFICATION: Booking $resId confirmed for {$validated['user']['phone']}. Will be implemented later.");
        }

        $this->logActivity($reservation, 'Reserva creada', 'creation');

        return response()->json([
            'success' => true,
            'reservationId' => $resId,
            'data' => $reservation->load(['customer', 'activities'])
        ], 201);
    }

    // Admin: Full update of reservation details
    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        // Allow partial PATCH for status only
        if ($request->isMethod('patch') && $request->has('status') && count($request->all()) === 1) {
            $validated = $request->validate([
                'status' => 'required|string'
            ]);

            $oldStatus = $reservation->status;
            $reservation->update(['status' => $validated['status']]);
            
            $this->logActivity(
                $reservation, 
                "Estado cambiado de $oldStatus a {$validated['status']}", 
                'status_change',
                ['from' => $oldStatus, 'to' => $validated['status']]
            );

            return response()->json([
                'success' => true,
                'data' => $reservation->load(['customer', 'activities'])
            ]);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required|string',
            'guests' => 'required|integer|min:1',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'special_requests' => 'nullable|string',
            'status' => 'required|string',
            'table_type_id' => 'required|exists:table_types,id',
            'special_event_id' => 'nullable|exists:special_events,id'
        ]);

        $reservation = Reservation::findOrFail($id);
        
        $email = $validated['email'] ?? null;
        $phone = $validated['phone'] ?? null;
        $name = $validated['name'];
        $customer = null;

        if ($email) {
            $customer = Customer::updateOrCreate(
                ['email' => $email],
                ['name' => $name, 'phone' => $phone]
            );
        } elseif ($phone) {
            $customer = Customer::updateOrCreate(
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

        // Check if status is changing and enforce transition rules
        if ($reservation->status !== $validated['status']) {
            if (!$this->canTransition($reservation->status, $validated['status'])) {
                return response()->json(['error' => 'Invalid status transition from ' . $reservation->status . ' to ' . $validated['status']], 422);
            }
        }

        $oldStatus = $reservation->status;
        $reservation->update([
            'customer_id' => $customer->id,
            'date' => $validated['date'],
            'time' => $validated['time'],
            'guests' => $validated['guests'],
            'special_requests' => $validated['special_requests'] ?? '',
            'status' => $validated['status'],
            'table_type_id' => $validated['table_type_id'],
            'special_event_id' => $validated['special_event_id'] ?? null,
        ]);

        if ($oldStatus !== $reservation->status) {
            $this->logActivity(
                $reservation, 
                "Estado cambiado de $oldStatus a {$reservation->status}", 
                'status_change',
                ['from' => $oldStatus, 'to' => $reservation->status]
            );
        }

        return response()->json([
            'success' => true,
            'data' => $reservation->load(['customer', 'activities'])
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        
        $reservation = Reservation::findOrFail($id);
        $oldStatus = $reservation->status;
        
        if ($oldStatus === $request->status) {
            return response()->json(['success' => true, 'data' => $reservation]);
        }

        $reservation->status = $request->status;
        $reservation->save();

        $this->logActivity(
            $reservation, 
            "Estado cambiado de $oldStatus a {$request->status}", 
            'status_change',
            ['from' => $oldStatus, 'to' => $request->status]
        );

        return response()->json(['success' => true, 'data' => $reservation->load(['customer', 'tableType', 'specialEvent', 'activities'])]);
    }

    private function logActivity($reservation, $description, $type = 'status_change', $metadata = null)
    {
        \App\Models\ReservationActivity::create([
            'reservation_id' => $reservation->id,
            'description' => $description,
            'type' => $type,
            'metadata' => $metadata
        ]);
    }

    private function canTransition($from, $to)
    {
        return true; // No restrictions
    }
}
