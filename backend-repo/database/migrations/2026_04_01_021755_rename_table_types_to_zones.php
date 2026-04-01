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
        Schema::rename('table_types', 'zones');

        Schema::table('reservations', function (Blueprint $table) {
            $table->renameColumn('table_type_id', 'zone_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->renameColumn('zone_id', 'table_type_id');
        });

        Schema::rename('zones', 'table_types');
    }
};
