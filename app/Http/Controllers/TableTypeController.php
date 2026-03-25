<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\TableType;

class TableTypeController extends Controller
{
    // index — list all for admin
    public function index() {
        return response()->json(
            TableType::orderBy('sort_order')->get()
        );
    }

    // publicIndex — list active only for client
    public function publicIndex() {
        return response()->json(
            TableType::where('is_active', true)
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
            TableType::create($request->all()), 201
        );
    }

    // update
    public function update(Request $request, TableType $tableType) {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'integer',
        ]);
        $tableType->update($request->all());
        return response()->json($tableType);
    }

    // destroy
    public function destroy(TableType $tableType) {
        $tableType->delete();
        return response()->json(null, 204);
    }
}
