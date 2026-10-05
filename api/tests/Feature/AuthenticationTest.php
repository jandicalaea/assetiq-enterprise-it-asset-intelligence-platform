<?php

namespace Tests\Feature;

 
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function asSpa()
    {
        $token = 'assetiq-test-csrf-token';

        return $this
            ->withHeader('Origin', 'http://localhost:5173')
            ->withSession(['_token' => $token])
            ->withHeader('X-CSRF-TOKEN', $token);
    }

    public function test_authenticated_user_can_log_in_and_read_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@assetiq.local',
            'password' => Hash::make('secret-password'),
        ]);

        $login = $this->asSpa()->postJson('/api/login', [
            'email' => 'admin@assetiq.local',
            'password' => 'secret-password',
        ]);

        $login
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'admin@assetiq.local');

        $this->assertAuthenticatedAs($user);

        $this->asSpa()
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'admin@assetiq.local');
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        User::factory()->create([
            'email' => 'admin@assetiq.local',
            'password' => Hash::make('secret-password'),
        ]);

        $this->asSpa()
            ->postJson('/api/login', [
                'email' => 'admin@assetiq.local',
                'password' => 'wrong-password',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_protected_api_routes_require_authentication(): void
    {
        $this->asSpa()
            ->getJson('/api/analytics/overview')
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_log_out(): void
    {
        User::factory()->create([
            'email' => 'admin@assetiq.local',
            'password' => Hash::make('secret-password'),
        ]);

        $this->asSpa()
            ->postJson('/api/login', [
                'email' => 'admin@assetiq.local',
                'password' => 'secret-password',
            ])
            ->assertOk();

        $this->asSpa()
            ->getJson('/api/user')
            ->assertOk();

        $this->asSpa()
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Signed out successfully.');

        Auth::forgetGuards();

        $this->asSpa()
            ->getJson('/api/user')
            ->assertUnauthorized();
    }
}