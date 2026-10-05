<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hotfix extends Model
{
    protected $fillable = [
        'pc_name',
        'hotfix_id',
        'installed_date',
    ];

    protected $casts = [
        'installed_date' => 'date',
    ];

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class, 'pc_name', 'pc_name');
    }
}