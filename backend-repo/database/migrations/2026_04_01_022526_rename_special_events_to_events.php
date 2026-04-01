<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('special_events', 'events');
        
        Schema::table('reservations', function (Blueprint $table) {
            $table->renameColumn('special_event_id', 'event_id');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->renameColumn('event_id', 'special_event_id');
        });

        Schema::rename('events', 'special_events');
    }
};
