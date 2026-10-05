<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $password = env('ASSETIQ_ADMIN_PASSWORD');

        if (! $password) {
            $this->command?->warn(
                'ASSETIQ_ADMIN_PASSWORD is not set. Skipping the local AssetIQ user seed.'
            );

            return;
        }

        User::updateOrCreate(
            ['email' => env('ASSETIQ_ADMIN_EMAIL', 'admin@assetiq.local')],
            [
                'name' => env('ASSETIQ_ADMIN_NAME', 'AssetIQ Administrator'),
                'password' => Hash::make($password),
            ]
        );
    }
}
