<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SoftwareResource;
use App\Models\Machine;

class SoftwareController extends Controller
{
    public function index(string $pc_name)
    {
        $machine = Machine::where('pc_name', $pc_name)->firstOrFail();

        return SoftwareResource::collection(
            $machine->software()->orderBy('name')->get()
        );
    }
}