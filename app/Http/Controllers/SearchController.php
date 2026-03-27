<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Customer;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $q = trim($request->query('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['reservations' => [], 'customers' => []]);
        }

        $term = '%' . $q . '%';

        // --- Reservations ---
        $reservations = Reservation::with('customer')
            ->where(function ($query) use ($term, $q) {
                $query->whereHas('customer', function ($cq) use ($term) {
                    $cq->where('name', 'like', $term)
                       ->orWhere('phone', 'like', $term);
                })
                ->orWhere('date', 'like', $term);
            })
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($r) {
                $date = $r->date ? Carbon::parse($r->date) : null;
                $today = Carbon::today();
                $tomorrow = Carbon::tomorrow();

                if ($date) {
                    if ($date->isSameDay($today)) {
                        $dateLabel = 'Hoy';
                    } elseif ($date->isSameDay($tomorrow)) {
                        $dateLabel = 'Mañana';
                    } else {
                        $dateLabel = $date->format('d/m/Y');
                    }
                } else {
                    $dateLabel = '';
                }

                return [
                    'id'          => $r->id,
                    'name'        => $r->customer->name ?? '—',
                    'time'        => $r->time ?? '',
                    'date_label'  => $dateLabel,
                    'status'      => $r->status ?? '',
                ];
            });

        // --- Customers ---
        $customers = Customer::where('name', 'like', $term)
            ->orWhere('email', 'like', $term)
            ->orWhere('phone', 'like', $term)
            ->withCount('reservations')
            ->orderBy('name')
            ->limit(5)
            ->get()
            ->map(function ($c) {
                return [
                    'id'                 => $c->id,
                    'name'               => $c->name,
                    'email'              => $c->email ?? '',
                    'phone'              => $c->phone ?? '',
                    'reservations_count' => $c->reservations_count,
                ];
            });

        return response()->json([
            'reservations' => $reservations,
            'customers'    => $customers,
        ]);
    }
}
