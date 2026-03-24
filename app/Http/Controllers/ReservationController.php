<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    // Admin: Get all reservations
    public function index()
    {
        return response()->json(Reservation::orderBy('date', 'asc')->get());
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

        $reservation = Reservation::create([
            'reservation_id' => $resId,
            'name' => $validated['user']['name'],
            'email' => $validated['user']['email'],
            'phone' => $validated['user']['phone'],
            'date' => $validated['date'],
            'time' => $validated['slot']['time'],
            'guests' => $validated['guests'],
            'special_requests' => $validated['user']['specialRequests'],
            'status' => 'confirmed'
        ]);

        // Simulated WhatsApp logging as requested by user
        if (!empty($validated['user']['phone'])) {
            Log::info("WHATSAPP NOTIFICATION: Booking $resId confirmed for {$validated['user']['phone']}. Will be implemented later.");
        }

        return response()->json([
            'success' => true,
            'reservationId' => $resId,
            'data' => $reservation
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
        $reservation->update($validated);

        return response()->json([
            'success' => true,
            'data' => $reservation
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
