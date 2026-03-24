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

    // Customer: Submit a new reservation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'slot.time' => 'required|string',
            'guests' => 'required|integer|min:1',
            'user.name' => 'required|string|max:255',
            'user.email' => 'required|email|max:255',
            'user.phone' => 'nullable|string|max:20',
            'user.specialRequests' => 'nullable|string'
        ]);

        $resId = '#' . rand(1000, 9999);

        // Find or create customer
        $customer = Customer::firstOrCreate(
            ['email' => $validated['user']['email']],
            [
                'name'  => $validated['user']['name'],
                'phone' => $validated['user']['phone'] ?? null,
            ]
        );

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
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'special_requests' => 'nullable|string',
            'status' => 'required|in:pending,confirmed,cancelled,no_show'
        ]);

        $reservation = Reservation::findOrFail($id);
        
        $customer = Customer::firstOrCreate(
            ['email' => $validated['email']],
            ['name' => $validated['name'], 'phone' => $validated['phone']]
        );

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
