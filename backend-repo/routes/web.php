<?php

use Illuminate\Support\Facades\Route;

// Catch-all for React SPA
Route::get('/{any}', function () {
    return response()->file(public_path('index.html'));
})->where('any', '.*');

