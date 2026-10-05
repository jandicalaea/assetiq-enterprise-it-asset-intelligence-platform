<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotfix;
use App\Models\Machine;
use App\Models\Software;
use App\Models\Vulnerability;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function overview(): JsonResponse
    {
        return response()->json([
            'total_assets' => Machine::count(),
            'total_software' => Software::count(),
            'total_hotfixes' => Hotfix::count(),
            'total_vulnerabilities' => Vulnerability::count(),
            'critical_vulnerabilities' => Vulnerability::where('severity', 'CRITICAL')->count(),
            'open_vulnerabilities' => Vulnerability::where('status', 'Open')->count(),
            'risky_assets' => Machine::where('risky_software_present', true)->count(),
        ]);
    }

    public function security(): JsonResponse
    {
        $severity = Vulnerability::query()
            ->selectRaw('severity, COUNT(*) as count')
            ->groupBy('severity')
            ->orderByDesc('count')
            ->get();

        $status = Vulnerability::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get();

        $patchStatus = Machine::query()
            ->selectRaw('patch_status, COUNT(*) as count')
            ->groupBy('patch_status')
            ->orderByDesc('count')
            ->get();

        return response()->json([
            'vulnerability_severity' => $severity,
            'vulnerability_status' => $status,
            'patch_status' => $patchStatus,
            'risky_assets' => Machine::where('risky_software_present', true)->count(),
            'critical_assets' => Machine::where('has_critical_vuln', true)->count(),
        ]);
    }

    public function hardware(): JsonResponse
    {
        $byDepartment = Machine::query()
            ->selectRaw('department, COUNT(*) as count')
            ->groupBy('department')
            ->orderByDesc('count')
            ->get();

        $byOs = Machine::query()
            ->selectRaw('os_name, COUNT(*) as count')
            ->groupBy('os_name')
            ->orderByDesc('count')
            ->get();

        $averages = Machine::query()
            ->selectRaw('
                AVG(ram_gb) as average_ram_gb,
                AVG(storage_gb) as average_storage_gb,
                AVG(cpu_cores) as average_cpu_cores
            ')
            ->first();

        return response()->json([
            'assets_by_department' => $byDepartment,
            'assets_by_os' => $byOs,
            'averages' => [
                'ram_gb' => round((float) $averages->average_ram_gb, 2),
                'storage_gb' => round((float) $averages->average_storage_gb, 2),
                'cpu_cores' => round((float) $averages->average_cpu_cores, 2),
            ],
        ]);
    }
}