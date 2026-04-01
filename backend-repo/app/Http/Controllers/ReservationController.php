<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Customer;
use App\Models\DayStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\NotificationService;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50]) ? $perPage : 10;

        $query = Reservation::with(['customer' => function($q) {
            $q->withCount([
                'reservations as reservations_count',
                'reservations as arrived_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_ASISTIO);
                },
                'reservations as confirmed_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_CONFIRMADA);
                },
                'reservations as cancelled_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_CANCELADA);
                },
                'reservations as no_show_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_NO_ASISTIO);
                }
            ]);
        }, 'zone', 'event'])->latest();

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

        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('date', [$request->from, $request->to]);
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
        $reservation = Reservation::with(['customer' => function($q) {
            $q->withCount([
                'reservations as reservations_count',
                'reservations as arrived_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_ASISTIO);
                },
                'reservations as no_show_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_NO_ASISTIO);
                }
            ]);
        }, 'zone', 'event', 'activities'])->findOrFail($id);
        return response()->json($reservation);
    }

    public function dashboard(Request $request)
    {
        $date = $request->query('date', date('Y-m-d'));
        
        $reservations = Reservation::with(['customer' => function($q) {
            $q->withCount([
                'reservations as reservations_count',
                'reservations as arrived_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_ASISTIO);
                },
                'reservations as no_show_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_NO_ASISTIO);
                }
            ]);
        }, 'zone', 'event'])
            ->where('date', $date)
            ->latest()
            ->get();

        $dayStatusRecord = DayStatus::where('date', $date)->first();
        $dayStatus = $dayStatusRecord ? $dayStatusRecord->status : DayStatus::STATUS_ABIERTO;
        $dayReason = $dayStatusRecord ? $dayStatusRecord->reason : null;

        $bySource = Reservation::selectRaw("source, COUNT(*) as count")
            ->where('date', $date)
            ->groupBy('source')
            ->get()
            ->keyBy('source');

        return response()->json([
            'reservations' => $reservations,
            'dayStatus'    => $dayStatus,
            'dayReason'    => $dayReason,
            'bySource'     => $bySource
        ]);
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
                'monday' => ['open' => true, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]],
                'tuesday' => ['open' => true, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]],
                'wednesday' => ['open' => true, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]],
                'thursday' => ['open' => true, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]],
                'friday' => ['open' => true, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]],
                'saturday' => ['open' => true, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]],
                'sunday' => ['open' => true, 'slots' => ["13:00"=>true, "13:30"=>true, "14:00"=>true, "14:30"=>true, "20:00"=>true, "20:30"=>true, "21:00"=>true, "21:30"=>true, "22:00"=>true, "22:30"=>true, "23:00"=>true, "23:30"=>true]],
            ],
            'blockedDays' => []
        ];

        $savedConfig = \Illuminate\Support\Facades\Cache::rememberForever('config.json', function() {
            return \Illuminate\Support\Facades\Storage::exists('config.json') 
                ? (json_decode(\Illuminate\Support\Facades\Storage::get('config.json'), true) ?? []) 
                : [];
        });
        $config = array_replace_recursive($defaultConfig, $savedConfig);
        
        $dayOfWeek = strtolower(date('l', strtotime($date)));
        $dayConfig = $config['schedule'][$dayOfWeek] ?? ['open' => false, 'slots' => []];

        // Check explicit day status from DB
        $dayStatus = DayStatus::where('date', $date)->value('status') ?: DayStatus::STATUS_ABIERTO;

        if (!$dayConfig['open'] || collect($config['blockedDays'] ?? [])->contains($date) || $dayStatus !== DayStatus::STATUS_ABIERTO) {
            return response()->json([]);
        }

        $totalCapacity = $config['totalCapacity'] ?? 40;

        $reservedGuestsForSlots = \App\Models\Reservation::where('date', $date)
            ->whereIn('status', [Reservation::STATUS_CONFIRMADA, Reservation::STATUS_PENDIENTE])
            ->selectRaw('time, SUM(guests) as total_guests')
            ->groupBy('time')
            ->pluck('total_guests', 'time');

        $masterSlots = [];
        if (isset($dayConfig['shifts']) && is_array($dayConfig['shifts']) && !empty($dayConfig['shifts'])) {
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
        $source = Reservation::SOURCE_WEB;
        if ($request->header('X-Source') === 'whatsapp') {
            $source = Reservation::SOURCE_WHATSAPP;
        }
        return $this->createReservation($request, Reservation::STATUS_PENDIENTE, $source);
    }

    // Admin: Create a new reservation (always CONFIRMADA, source=admin)
    public function adminStore(Request $request)
    {
        return $this->createReservation($request, Reservation::STATUS_CONFIRMADA, Reservation::SOURCE_MANUAL);
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
            'zone_id' => 'required|exists:zones,id',
            'event_id' => 'nullable|exists:events,id'
        ]);

        // Re-validate availability for non-admin sources
        if ($source !== Reservation::SOURCE_MANUAL) {
            $isAvailable = $this->isSlotAvailable(
                $validated['date'],
                $validated['slot']['time'],
                $validated['guests']
            );

            if (!$isAvailable) {
                return response()->json([
                    'message' => 'No hay disponibilidad para esta fecha'
                ], 422);
            }
        }

        $resId = (string) rand(1000, 9999);

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
            'zone_id'    => $validated['zone_id'],
            'event_id' => $validated['event_id'] ?? null,
        ]);

        $notificationService = app(NotificationService::class);
        if ($status === Reservation::STATUS_PENDIENTE) {
            $notificationService->notify('received', $reservation);
        } else {
            $notificationService->notify('confirmed', $reservation);
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
            $reservation->update([
                'status' => $validated['status'],
                'cancellation_reason' => $request->input('cancellation_reason')
            ]);
            
            $this->logActivity(
                $reservation, 
                "Estado cambiado de $oldStatus a {$validated['status']}", 
                'status_change',
                ['from' => $oldStatus, 'to' => $validated['status'], 'reason' => $request->input('cancellation_reason')]
            );

            $this->handleStatusNotification($reservation, $oldStatus);

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
            'zone_id' => 'required|exists:zones,id',
            'event_id' => 'nullable|exists:events,id'
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
            'zone_id' => $validated['zone_id'],
            'event_id' => $validated['event_id'] ?? null,
        ]);

        if ($oldStatus !== $reservation->status) {
            $this->logActivity(
                $reservation, 
                "Estado cambiado de $oldStatus a {$reservation->status}", 
                'status_change',
                ['from' => $oldStatus, 'to' => $reservation->status]
            );
            $this->handleStatusNotification($reservation, $oldStatus);
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
        if ($request->filled('cancellation_reason')) {
            $reservation->cancellation_reason = $request->cancellation_reason;
        }
        $reservation->save();

        $this->logActivity(
            $reservation, 
            "Estado cambiado de $oldStatus a {$request->status}", 
            'status_change',
            ['from' => $oldStatus, 'to' => $request->status, 'reason' => $reservation->cancellation_reason]
        );

        $this->handleStatusNotification($reservation, $oldStatus);

        return response()->json(['success' => true, 'data' => $reservation->load(['customer', 'zone', 'event', 'activities'])]);
    }

    public function availability(Request $request)
    {
        $date = $request->query('date');
        $guests = (int) $request->query('guests', 1);

        if (!$date) return response()->json(['slots' => [], 'shifts' => []]);

        $defaultConfig = [
            'totalCapacity' => 40,
            'schedule' => [
                'monday' => ['open' => true, 'shifts' => []],
                'tuesday' => ['open' => true, 'shifts' => []],
                'wednesday' => ['open' => true, 'shifts' => []],
                'thursday' => ['open' => true, 'shifts' => []],
                'friday' => ['open' => true, 'shifts' => []],
                'saturday' => ['open' => true, 'shifts' => []],
                'sunday' => ['open' => true, 'shifts' => []],
            ]
        ];

        $savedConfig = \Illuminate\Support\Facades\Cache::rememberForever('config.json', function() {
            return \Illuminate\Support\Facades\Storage::exists('config.json') 
                ? (json_decode(\Illuminate\Support\Facades\Storage::get('config.json'), true) ?? []) 
                : [];
        });
        $config = array_replace_recursive($defaultConfig, $savedConfig);

        $dayOfWeek = strtolower(date('l', strtotime($date)));
        $dayConfig = $config['schedule'][$dayOfWeek] ?? ['open' => false, 'shifts' => []];

        if (!$dayConfig['open']) return response()->json(['slots' => [], 'shifts' => []]);

        $totalCapacity = $config['totalCapacity'] ?? 40;
        $reservedGuestsForSlots = \App\Models\Reservation::where('date', $date)
            ->whereIn('status', [Reservation::STATUS_CONFIRMADA, Reservation::STATUS_PENDIENTE])
            ->selectRaw('time, SUM(guests) as total_guests')
            ->groupBy('time')
            ->pluck('total_guests', 'time');

        $slots = [];
        $shifts = [];

        $rawShifts = $dayConfig['shifts'] ?? [];
        foreach ($rawShifts as $index => $rawShift) {
            $shiftSlots = [];
            foreach ($rawShift['slots'] as $time => $isOpen) {
                if ($isOpen) {
                    $booked = (int) $reservedGuestsForSlots->get($time, 0);
                    if (($totalCapacity - $booked) >= $guests) {
                        $shiftSlots[] = $time;
                        $slots[] = $time;
                    }
                }
            }
            if (!empty($shiftSlots)) {
                $shifts[] = [
                    'name' => "Turno " . ($index + 1),
                    'slots' => $shiftSlots
                ];
            }
        }

        return response()->json([
            'slots' => $slots,
            'shifts' => $shifts
        ]);
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

    private function isSlotAvailable($date, $time, $guests)
    {
        $request = new \Illuminate\Http\Request([
            'date' => $date,
            'guests' => $guests
        ]);

        $slotsRes = $this->availableSlots($request);
        $availableSlots = json_decode($slotsRes->getContent(), true);

        if (!is_array($availableSlots)) return false;

        foreach ($availableSlots as $slot) {
            if ($slot['time'] === $time && ($slot['available'] ?? false) === true) {
                return true;
            }
        }

        return false;
    }

    private function handleStatusNotification(Reservation $reservation, string $oldStatus): void
    {
        // Only send if status actually changed
        if ($oldStatus === $reservation->status) return;

        $notificationService = app(NotificationService::class);

        if ($reservation->status === Reservation::STATUS_CONFIRMADA) {
            $notificationService->notify('confirmed', $reservation);
        } elseif ($reservation->status === Reservation::STATUS_CANCELADA) {
            $notificationService->notify('cancelled', $reservation);
        }
    }

}
