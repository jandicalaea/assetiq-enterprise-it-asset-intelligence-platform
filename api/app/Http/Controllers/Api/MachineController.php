<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MachineResource;
use App\Models\Machine;
use Illuminate\Http\JsonResponse;

class MachineController extends Controller
{
    public function index()
    {
        $search = trim((string) request('search', ''));

        $machines = Machine::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('pc_name', 'like', "%{$search}%")
                        ->orWhere('department', 'like', "%{$search}%")
                        ->orWhere('os_name', 'like', "%{$search}%")
                        ->orWhere('cpu', 'like', "%{$search}%");
                });
            })
            ->orderBy('pc_name')
            ->paginate(request()->integer('per_page', 20))
            ->withQueryString();

        return MachineResource::collection($machines);
    }
}