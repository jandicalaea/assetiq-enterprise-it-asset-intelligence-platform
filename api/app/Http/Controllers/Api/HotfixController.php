<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HotfixResource;
use App\Models\Machine;

class HotfixController extends Controller
{
    public function index(string $pc_name)
    {
        $machine = Machine::where('pc_name', $pc_name)->firstOrFail();

        return HotfixResource::collection(
            $machine->hotfixes()->orderByDesc('installed_date')->get()
        );
    }
}