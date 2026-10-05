<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pc_name' => $this->pc_name,
            'department' => $this->department,
            'os_name' => $this->os_name,
            'cpu' => $this->cpu,
            'cpu_cores' => $this->cpu_cores,
            'ram_gb' => $this->ram_gb,
            'storage_gb' => $this->storage_gb,

            'hotfix_count' => $this->hotfix_count,
            'software_count' => $this->software_count,
            'vuln_count' => $this->vuln_count,

            'has_critical_vuln' => $this->has_critical_vuln,
            'patch_status' => $this->patch_status,
            'risky_software_present' => $this->risky_software_present,

            'software' => SoftwareResource::collection(
                $this->whenLoaded('software')
            ),

            'hotfixes' => HotfixResource::collection(
                $this->whenLoaded('hotfixes')
            ),

            'vulnerabilities' => VulnerabilityResource::collection(
                $this->whenLoaded('vulnerabilities')
            ),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}