<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('google_maps_link')->nullable()->after('review_link');
            $table->string('menu_pdf')->nullable()->after('google_maps_link');
            $table->string('reservation_link')->nullable()->after('menu_pdf');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['google_maps_link', 'menu_pdf', 'reservation_link']);
        });
    }
};
