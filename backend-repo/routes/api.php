<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\DayStatusController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Storage;

// Public Endpoints (Customer Frontend)
Route::get('/health', function () {
    $startTime = defined('LARAVEL_START') ? LARAVEL_START : microtime(true);
    try {
        \DB::connection()->getPdo();
        return response()->json([
            'status' => 'API is online',
            'response_time' => round((microtime(true) - $startTime) * 1000) . ' ms',
            'body' => ['database' => 'connected']
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'API is down',
            'response_time' => round((microtime(true) - $startTime) * 1000) . ' ms',
            'body' => ['error' => $e->getMessage()]
        ], 500);
    }
});
Route::post('/reservations', [ReservationController::class, 'store']);
Route::get('/slots', [ReservationController::class, 'availableSlots']);
// Endpoint for config
Route::get('/config', [SettingsController::class, 'index']);
// Endpoint for zones
use App\Http\Controllers\ZoneController;
Route::get('/zones', [ZoneController::class, 'publicIndex']);
// Endpoint for events
use App\Http\Controllers\EventController;
Route::get('/events', [EventController::class, 'publicIndex']);
Route::get('/day-status', [DayStatusController::class, 'show']);
Route::get('/availability', [ReservationController::class, 'availability']);

// Admin Authentication
Route::post('/admin/login', [AuthController::class, 'login']);

// Template Previews (Public or token-based, moved out of sanctum to avoid login redirect)
Route::prefix('admin/templates/preview')->group(function () {
    Route::get('/email/{type}', [SettingsController::class, 'previewTemplate']);
    Route::get('/whatsapp/{type}', [SettingsController::class, 'previewWhatsAppTemplate']);
});

// Protected Admin Endpoints
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::get('/dashboard', [ReservationController::class, 'dashboard']);
    Route::post('/reservations', [ReservationController::class, 'adminStore']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::match(['put', 'patch'], '/reservations/{id}', [ReservationController::class, 'update']);
    Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
    
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::get('/customers/{customer}/stats', [CustomerController::class, 'stats']);
    Route::get('/customers/{customer}/reservations', [CustomerController::class, 'reservations']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

    Route::get('/zones', [ZoneController::class, 'index']);
    Route::post('/zones', [ZoneController::class, 'store']);
    Route::put('/zones/{zone}', [ZoneController::class, 'update']);
    Route::delete('/zones/{zone}', [ZoneController::class, 'destroy']);

    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/config', [SettingsController::class, 'updateConfig']);
    Route::get('/blocked-dates', [DayStatusController::class, 'index']);
    Route::get('/search', [SearchController::class, 'index']);
    Route::get('/day-status', [DayStatusController::class, 'show']);
    Route::patch('/day-status', [DayStatusController::class, 'update']);
    Route::get('/me', [ProfileController::class, 'show']);
    Route::patch('/me', [ProfileController::class, 'update']);
});
