<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Storage;

// Public Endpoints (Customer Frontend)
Route::post('/reservations', [ReservationController::class, 'store']);
Route::get('/slots', [ReservationController::class, 'availableSlots']);
// Endpoint for config
Route::get('/config', [SettingsController::class, 'index']);

// Admin Authentication
Route::post('/admin/login', [AuthController::class, 'login']);

// Protected Admin Endpoints
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::match(['put', 'patch'], '/reservations/{id}', [ReservationController::class, 'update']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/config', [SettingsController::class, 'updateConfig']);
});
