<?php

namespace App\Http\Controllers;

use App\Models\DayStatus;
use Illuminate\Http\Request;

class DayStatusController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, (int) $request->query('per_page', 10));
        
        $results = DayStatus::where('status', '!=', DayStatus::STATUS_ABIERTO)
            ->where('date', '>=', date('Y-m-d')) // only future/today
            ->orderBy('date')
            ->paginate($perPage);

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

    public function show(Request $request)
    {
        $date = $request->query('date', date('Y-m-d'));
        $status = DayStatus::where('date', $date)->first();

        return response()->json($status ?: [
            'date' => $date,
            'status' => DayStatus::STATUS_ABIERTO,
            'reason' => null
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'date'   => 'required|date',
            'status' => 'required|string|in:ABIERTO,CERRADO,BLOQUEADO',
            'reason' => 'nullable|string'
        ]);

        $dayStatus = DayStatus::updateOrCreate(
            ['date' => $validated['date']],
            ['status' => $validated['status'], 'reason' => $validated['reason'] ?? null]
        );

        return response()->json([
            'success' => true,
            'data'    => $dayStatus
        ]);
    }
}
