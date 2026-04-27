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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservation_id')->nullable();
            $table->string('channel'); // email, whatsapp
            $table->string('template'); // received, confirmed, cancelled, reminder_2h, review
            $table->string('recipient');
            $table->string('status'); // sent, failed, invalid
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->foreign('reservation_id')->references('id')->on('reservations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
