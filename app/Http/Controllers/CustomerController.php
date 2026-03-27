<?php
namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) ($request->per_page ?? 10);
        $perPage = in_array($perPage, [10, 25, 50]) ? $perPage : 10;

        $query = Customer::query();

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('email', 'like', $term)
                  ->orWhere('phone', 'like', $term);
            });
        }

        $results = $query->orderBy('name')->paginate($perPage);

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

    public function show(Customer $customer)
    {
        $stats = [
            'total_reservations' => $customer->reservations()->count(),
            'last_visit'         => $customer->reservations()->max('date'),
            'no_shows'           => $customer->reservations()->where('status', \App\Models\Reservation::STATUS_NO_ASISTIO)->count(),
        ];

        $stats['attendance_ratio'] = $stats['total_reservations'] > 0 
            ? round((($stats['total_reservations'] - $stats['no_shows']) / $stats['total_reservations']) * 100)
            : 0;

        return response()->json([
            'id'    => $customer->id,
            'name'  => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'stats' => $stats
        ]);
    }

    public function reservations(Customer $customer, Request $request)
    {
        $perPage = (int) ($request->per_page ?? 10);
        $perPage = in_array($perPage, [10, 25, 50]) ? $perPage : 10;

        $query = $customer->reservations()->with(['tableType', 'specialEvent']);

        if ($request->filled('filter')) {
            $filter = $request->filter;
            if ($filter === 'CONFIRMADA') {
                $query->where('status', \App\Models\Reservation::STATUS_CONFIRMADA);
            } elseif ($filter === 'NO_SHOW') {
                $query->where('status', \App\Models\Reservation::STATUS_NO_ASISTIO);
            }
        }

        $results = $query->orderByDesc('date')->orderByDesc('time')->paginate($perPage);

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

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20'
        ]);
        
        $customer->update($validated);
        return response()->json(['success' => true, 'data' => $customer]);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(['success' => true]);
    }
}
