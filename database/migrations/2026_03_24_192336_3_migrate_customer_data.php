<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        // Step 1: Insert distinct customers from reservations
        $reservations = DB::table('reservations')
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->select('name', 'email', 'phone', 'created_at', 'updated_at')
            ->distinct()
            ->get();

        foreach ($reservations as $res) {
            DB::table('customers')->updateOrInsert(
                ['email' => $res->email],
                (array)$res
            );
        }

        // Step 2: Link reservations to customers
        $customers = DB::table('customers')->get(['id', 'email']);
        foreach ($customers as $customer) {
            DB::table('reservations')
                ->where('email', $customer->email)
                ->update(['customer_id' => $customer->id]);
        }
    }

    public function down(): void {
        $customers = DB::table('customers')->get(['id', 'name', 'email', 'phone']);
        foreach ($customers as $customer) {
            DB::table('reservations')
                ->where('customer_id', $customer->id)
                ->update([
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone
                ]);
        }
    }
};
