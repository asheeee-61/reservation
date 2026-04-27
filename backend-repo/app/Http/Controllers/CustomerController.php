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

        // Add counts for credibility calculation
        $query->withCount([
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string'
        ]);
        
        $customer = Customer::create($validated);
        return response()->json(['success' => true, 'data' => $customer], 201);
    }

    public function show(Customer $customer)
    {
        $customer->loadCount([
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
        return response()->json($customer);
    }

    public function stats(Customer $customer)
    {
        $customer->loadCount([
            'reservations as total_reservations',
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

        return response()->json([
            'total'     => $customer->total_reservations ?? 0,
            'arrived'   => $customer->arrived_count ?? 0,
            'confirmed' => $customer->confirmed_count ?? 0,
            'cancelled' => $customer->cancelled_count ?? 0,
            'noShow'    => $customer->no_show_count ?? 0,
            'last_visit' => $customer->reservations()->where('status', \App\Models\Reservation::STATUS_ASISTIO)->max('date'),
        ]);
    }

    public function reservations(Customer $customer, Request $request)
    {
        $perPage = (int) ($request->per_page ?? 10);
        $perPage = in_array($perPage, [10, 25, 50]) ? $perPage : 10;

        $query = $customer->reservations()->with(['zone', 'event']);

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
            'phone' => 'nullable|string|max:20',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string'
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
