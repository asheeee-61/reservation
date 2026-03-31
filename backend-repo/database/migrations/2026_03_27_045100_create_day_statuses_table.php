<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('day_statuses', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('status')->default('ABIERTO'); // ABIERTO, CERRADO, BLOQUEADO
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('day_statuses');
    }
};
