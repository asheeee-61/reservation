<?php

namespace App\Http\Controllers;

use App\Models\DayStatus;
use Illuminate\Http\Request;

class DayStatusController extends Controller
{
    public function show(Request $request)
    {
        $date = $request->query('date', date('Y-m-d'));
        $status = DayStatus::where('date', $date)->first();

        return response()->json([
            'date' => $date,
            'status' => $status ? $status->status : DayStatus::STATUS_ABIERTO
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'date'   => 'required|date',
            'status' => 'required|string|in:ABIERTO,CERRADO,BLOQUEADO',
        ]);

        $dayStatus = DayStatus::updateOrCreate(
            ['date' => $validated['date']],
            ['status' => $validated['status']]
        );

        return response()->json([
            'success' => true,
            'data'    => $dayStatus
        ]);
    }
}
