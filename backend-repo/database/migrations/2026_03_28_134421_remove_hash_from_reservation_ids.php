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
        Illuminate\Support\Facades\DB::statement("UPDATE reservations SET reservation_id = REPLACE(reservation_id, '#', '')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No way to recover original random IDs if some started with # and some didn't, 
        // but since we only had #1234, we could prepend it back if needed.
        Illuminate\Support\Facades\DB::statement("UPDATE reservations SET reservation_id = CONCAT('#', reservation_id) WHERE reservation_id NOT LIKE '#%'");
    }
};
