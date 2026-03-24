<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        DB::statement('
            INSERT IGNORE INTO customers (name, email, phone, created_at, updated_at)
            SELECT DISTINCT name, email, phone, created_at, updated_at
            FROM reservations
            WHERE email IS NOT NULL AND email != ""
        ');
        
        DB::statement('
            UPDATE reservations r
            JOIN customers c ON c.email = r.email
            SET r.customer_id = c.id
        ');
    }

    public function down(): void {
        DB::statement('
            UPDATE reservations r
            JOIN customers c ON c.id = r.customer_id
            SET r.name = c.name, r.email = c.email, r.phone = c.phone
        ');
    }
};
