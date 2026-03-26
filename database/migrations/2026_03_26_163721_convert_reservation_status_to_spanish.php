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
        // 1. Normalize existing data to Spanish equivalents
        DB::table('reservations')->where('status', 'PENDING')->update(['status' => 'PENDIENTE']);
        DB::table('reservations')->where('status', 'CONFIRMED')->update(['status' => 'CONFIRMADA']);
        DB::table('reservations')->where('status', 'COMPLETED')->update(['status' => 'ASISTIÓ']);
        DB::table('reservations')->where('status', 'NO_SHOW')->update(['status' => 'NO_ASISTIÓ']);

        // 2. Change column to flexible string with Spanish default
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('status')->default('PENDIENTE')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('status')->default('PENDING')->change();
        });
    }
};
