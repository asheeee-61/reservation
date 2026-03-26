<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Normalize existing data to uppercase to match the new strict ENUM
        DB::table('reservations')->where('status', 'pending')->update(['status' => 'PENDING']);
        DB::table('reservations')->where('status', 'confirmed')->update(['status' => 'CONFIRMED']);
        DB::table('reservations')->where('status', 'cancelled')->update(['status' => 'NO_SHOW']);
        DB::table('reservations')->where('status', 'no_show')->update(['status' => 'NO_SHOW']);

        // 2. Change column to strict ENUM
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('status')->default('PENDING')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }
};
