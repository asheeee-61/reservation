<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Zone;

class ZoneController extends Controller
{
    // index — list all for admin (paginated)
    public function index(Request $request) {
        $perPage = (int) ($request->per_page ?? 10);
        $perPage = in_array($perPage, [10, 25, 50]) ? $perPage : 10;

        $query = Zone::orderBy('sort_order');

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

    // publicIndex — list active only for client
    public function publicIndex() {
        return response()->json(
            Zone::where('is_active', true)
                      ->orderBy('sort_order')
                      ->get()
        );
    }

    // store
    public function store(Request $request) {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'integer',
        ]);
        return response()->json(
            Zone::create($request->all()), 201
        );
    }

    // update
    public function update(Request $request, Zone $zone) {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'integer',
        ]);
        $zone->update($request->all());
        return response()->json($zone);
    }

    // destroy
    public function destroy(Zone $zone) {
        $zone->delete();
        return response()->json(null, 204);
    }
}
