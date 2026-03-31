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
        // Update existing values to match new enum
        \DB::table('reservations')->where('source', 'client')->update(['source' => 'web']);
        \DB::table('reservations')->where('source', 'admin')->update(['source' => 'manual']);

        Schema::table('reservations', function (Blueprint $table) {
            $table->enum('source', ['web', 'manual', 'whatsapp'])->default('web')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('source')->default('client')->change();
        });
    }
};
