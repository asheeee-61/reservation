<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Reservation;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

class ReservationAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock zones
        Zone::create([
            'name' => 'Standard',
            'capacity' => 4,
            'is_active' => true
        ]);
        
        // Ensure config exists
        Storage::fake('local');
        Storage::put('config.json', json_encode([
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
            'zone_id' => Zone::first()->id
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
            'zone_id' => Zone::first()->id
        ];

        $response = $this->postJson('/api/reservations', $payload);

        $response->assertStatus(201);
    }
}
