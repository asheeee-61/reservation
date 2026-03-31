<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Reservation;
use App\Models\TableType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

class ReservationAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock table types
        TableType::create([
            'name' => 'Standard',
            'capacity' => 4,
            'is_active' => true
        ]);
        
        // Ensure config exists
        Storage::fake('local');
        Storage::put('config.json', json_encode([
            'totalCapacity' => 10,
            'schedule' => [
                'monday' => ['open' => true, 'slots' => ["18:00" => true]],
                'tuesday' => ['open' => true, 'slots' => ["18:00" => true]],
                'wednesday' => ['open' => true, 'slots' => ["18:00" => true]],
                'thursday' => ['open' => true, 'slots' => ["18:00" => true]],
                'friday' => ['open' => true, 'slots' => ["18:00" => true]],
                'saturday' => ['open' => true, 'slots' => ["18:00" => true]],
                'sunday' => ['open' => true, 'slots' => ["18:00" => true]],
            ],
            'blockedDays' => ['2026-12-25']
        ]));
    }

    /** @test */
    public function it_rejects_reservation_on_blocked_day()
    {
        $payload = [
            'date' => '2026-12-25',
            'slot' => ['time' => '18:00'],
            'guests' => 2,
            'user' => [
                'name' => 'John Doe',
                'phone' => '123456789'
            ],
            'table_type_id' => TableType::first()->id
        ];

        $response = $this->postJson('/api/reservations', $payload);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'No hay disponibilidad para esta fecha']);
    }

    /** @test */
    public function it_rejects_reservation_when_no_capacity_left()
    {
        // Mock capacity full for a date
        $date = '2026-04-01';
        $time = '18:00';
        
        $customer = \App\Models\Customer::create([
            'name' => 'Test Customer',
            'phone' => '111222333'
        ]);

        // Existing reservation uses all capacity (10)
        Reservation::create([
            'reservation_id' => '#1111',
            'customer_id' => $customer->id,
            'date' => $date,
            'time' => $time,
            'guests' => 10,
            'status' => Reservation::STATUS_CONFIRMADA,
            'source' => Reservation::SOURCE_ADMIN,
            'table_type_id' => TableType::first()->id
        ]);

        $payload = [
            'date' => $date,
            'slot' => ['time' => $time],
            'guests' => 1,
            'user' => [
                'name' => 'Jane Doe',
                'phone' => '987654321'
            ],
            'table_type_id' => TableType::first()->id
        ];

        $response = $this->postJson('/api/reservations', $payload);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'No hay disponibilidad para esta fecha']);
    }

    /** @test */
    public function it_allows_reservation_when_available()
    {
        $date = '2026-04-01';
        $time = '18:00';

        $payload = [
            'date' => $date,
            'slot' => ['time' => $time],
            'guests' => 2,
            'user' => [
                'name' => 'Alice Smith',
                'phone' => '1122334455'
            ],
            'table_type_id' => TableType::first()->id
        ];

        $response = $this->postJson('/api/reservations', $payload);

        $response->assertStatus(201);
    }
}
