<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Machine extends Model
{
    protected $fillable = [
        'pc_name',
        'department',
        'os_name',
        'cpu',
        'cpu_cores',
        'ram_gb',
        'storage_gb',
        'hotfix_count',
        'software_count',
        'vuln_count',
        'has_critical_vuln',
        'patch_status',
        'risky_software_present',
    ];

    protected $casts = [
        'has_critical_vuln' => 'boolean',
        'risky_software_present' => 'boolean',
        'cpu_cores' => 'integer',
        'ram_gb' => 'integer',
        'storage_gb' => 'integer',
        'hotfix_count' => 'integer',
        'software_count' => 'integer',
        'vuln_count' => 'integer',
    ];

    public function software(): HasMany
    {
        return $this->hasMany(Software::class, 'pc_name', 'pc_name');
    }

    public function hotfixes(): HasMany
    {
        return $this->hasMany(Hotfix::class, 'pc_name', 'pc_name');
    }

    public function vulnerabilities(): HasMany
    {
        return $this->hasMany(Vulnerability::class, 'pc_name', 'pc_name');
    }
}