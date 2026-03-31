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
        Schema::table('reservations', function (Blueprint $table) {
            $table->index('date');
            $table->index('time');
            $table->index('status');
            $table->index('customer_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->index('phone');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['phone']);
            $table->dropIndex(['email']);
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropIndex(['date']);
            $table->dropIndex(['time']);
            $table->dropIndex(['status']);
            $table->dropIndex(['customer_id']);
        });
    }
};
