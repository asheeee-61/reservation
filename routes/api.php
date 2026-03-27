<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\DayStatusController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Storage;

// Public Endpoints (Customer Frontend)
Route::post('/reservations', [ReservationController::class, 'store']);
Route::get('/slots', [ReservationController::class, 'availableSlots']);
// Endpoint for config
Route::get('/config', [SettingsController::class, 'index']);
// Endpoint for table types
use App\Http\Controllers\TableTypeController;
Route::get('/table-types', [TableTypeController::class, 'publicIndex']);
// Endpoint for special events
use App\Http\Controllers\SpecialEventController;
Route::get('/special-events', [SpecialEventController::class, 'publicIndex']);
Route::get('/day-status', [DayStatusController::class, 'show']);

// Admin Authentication
Route::post('/admin/login', [AuthController::class, 'login']);

// Protected Admin Endpoints
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'adminStore']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::match(['put', 'patch'], '/reservations/{id}', [ReservationController::class, 'update']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

    Route::get('/table-types', [TableTypeController::class, 'index']);
    Route::post('/table-types', [TableTypeController::class, 'store']);
    Route::put('/table-types/{tableType}', [TableTypeController::class, 'update']);
    Route::delete('/table-types/{tableType}', [TableTypeController::class, 'destroy']);

    Route::get('/special-events', [SpecialEventController::class, 'index']);
    Route::post('/special-events', [SpecialEventController::class, 'store']);
    Route::put('/special-events/{specialEvent}', [SpecialEventController::class, 'update']);
    Route::delete('/special-events/{specialEvent}', [SpecialEventController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/config', [SettingsController::class, 'updateConfig']);
    Route::get('/blocked-dates', [SettingsController::class, 'blockedDates']);
    Route::get('/search', [SearchController::class, 'index']);
    Route::patch('/day-status', [DayStatusController::class, 'update']);
});
