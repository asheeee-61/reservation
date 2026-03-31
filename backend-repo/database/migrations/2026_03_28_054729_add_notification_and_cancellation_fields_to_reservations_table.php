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
            $table->timestamp('reminder_2h_sent_at')->nullable()->after('status');
            $table->timestamp('review_sent_at')->nullable()->after('reminder_2h_sent_at');
            $table->string('cancellation_reason', 100)->nullable()->after('review_sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['reminder_2h_sent_at', 'review_sent_at', 'cancellation_reason']);
        });
    }
};
