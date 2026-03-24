<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AuthController;

// Public Endpoints (Customer Frontend)
Route::post('/reservations', [ReservationController::class, 'store']);
// Example endpoint for config
Route::get('/config', function() {
    return response()->json([
        'maxGuests' => 10,
        'minGuests' => 1,
        'restaurant' => [
            'name' => 'Hotaru Madrid',
            'address' => 'Calle de Alcalá 99, 28009 Madrid',
            'lat' => 40.4214,
            'lng' => -3.6846
        ]
    ]);
});

// Admin Authentication
Route::post('/admin/login', [AuthController::class, 'login']);

// Protected Admin Endpoints
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
