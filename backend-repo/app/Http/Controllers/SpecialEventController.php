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
    public function index(Request $request)
    {
        $perPage = (int) ($request->per_page ?? 10);
        $perPage = in_array($perPage, [10, 25, 50]) ? $perPage : 10;

        $query = SpecialEvent::orderBy('sort_order', 'asc');

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where('name', 'like', $term);
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
