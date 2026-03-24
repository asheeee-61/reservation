<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AuthController;

use Illuminate\Support\Facades\Storage;

// Public Endpoints (Customer Frontend)
Route::post('/reservations', [ReservationController::class, 'store']);
// Endpoint for config
Route::get('/config', function() {
    $defaultConfig = [
        'maxGuests' => 10,
        'minGuests' => 1,
        'restaurant' => [
            'name' => 'Hotaru Madrid',
            'address' => 'Calle de Alcalá 99, 28009 Madrid',
            'lat' => 40.4214,
            'lng' => -3.6846
        ],
        'schedule' => [
            'monday' => ['open' => true, 'slots' => []],
            'tuesday' => ['open' => true, 'slots' => []],
            'wednesday' => ['open' => true, 'slots' => []],
            'thursday' => ['open' => true, 'slots' => []],
            'friday' => ['open' => true, 'slots' => []],
            'saturday' => ['open' => true, 'slots' => []],
            'sunday' => ['open' => true, 'slots' => []],
        ],
        'blockedDays' => [],
        'capacity' => []
    ];

    if (Storage::exists('config.json')) {
        $savedConfig = json_decode(Storage::get('config.json'), true);
        return response()->json(array_merge($defaultConfig, $savedConfig));
    }

    return response()->json($defaultConfig);
});

// Admin Authentication
Route::post('/admin/login', [AuthController::class, 'login']);

// Protected Admin Endpoints
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/config', function(\Illuminate\Http\Request $request) {
        Storage::put('config.json', json_encode($request->all(), JSON_PRETTY_PRINT));
        return response()->json(['success' => true]);
    });
});
