<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\NotificationService::class, function ($app) {
            return new \App\Services\NotificationService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share restaurant name dynamically with all email views
        \Illuminate\Support\Facades\View::composer('emails.*', \App\View\Composers\RestaurantNameComposer::class);

        if (config('app.debug')) {
            \Illuminate\Support\Facades\DB::listen(function($query) {
                if ($query->time > 100) { // log queries over 100ms
                    \Illuminate\Support\Facades\Log::warning('Slow query: ' . $query->sql, [
                        'time' => $query->time,
                        'bindings' => $query->bindings
                    ]);
                }
            });
        }
    }
}
