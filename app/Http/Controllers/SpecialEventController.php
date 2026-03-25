<?php

namespace App\Http\Controllers;

use App\Models\SpecialEvent;
use Illuminate\Http\Request;

class SpecialEventController extends Controller
{
    /**
     * Public index for clients
     */
    public function publicIndex()
    {
        return response()->json(
            SpecialEvent::where('is_active', true)
                        ->orderBy('sort_order', 'asc')
                        ->get()
        );
    }

    /**
     * Admin index
     */
    public function index()
    {
        return response()->json(
            SpecialEvent::orderBy('sort_order', 'asc')->get()
        );
    }

    /**
     * Admin store
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $event = SpecialEvent::create($validated);
        return response()->json($event, 201);
    }

    /**
     * Admin update
     */
    public function update(Request $request, SpecialEvent $specialEvent)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $specialEvent->update($validated);
        return response()->json($specialEvent);
    }

    /**
     * Admin destroy
     */
    public function destroy(SpecialEvent $specialEvent)
    {
        $specialEvent->delete();
        return response()->json(null, 204);
    }
}
