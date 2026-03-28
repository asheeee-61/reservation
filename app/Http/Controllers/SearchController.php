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
        $reservations = Reservation::with(['customer' => function ($q) {
            $q->withCount([
                'reservations as reservations_count',
                'reservations as arrived_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_ASISTIO);
                },
                'reservations as no_show_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_NO_ASISTIO);
                }
            ]);
        }])
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
                    'customer'    => $r->customer ? [
                        'name'               => $r->customer->name,
                        'reservations_count' => $r->customer->reservations_count,
                        'arrived_count'      => $r->customer->arrived_count,
                        'no_show_count'      => $r->customer->no_show_count,
                    ] : null,
                ];
            });

        // --- Customers ---
        $customers = Customer::where('name', 'like', $term)
            ->orWhere('email', 'like', $term)
            ->orWhere('phone', 'like', $term)
            ->withCount([
                'reservations as reservations_count',
                'reservations as arrived_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_ASISTIO);
                },
                'reservations as no_show_count' => function ($q) {
                    $q->where('status', \App\Models\Reservation::STATUS_NO_ASISTIO);
                }
            ])
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
                    'arrived_count'      => $c->arrived_count,
                    'no_show_count'      => $c->no_show_count,
                ];
            });

        return response()->json([
            'reservations' => $reservations,
            'customers'    => $customers,
        ]);
    }
}
