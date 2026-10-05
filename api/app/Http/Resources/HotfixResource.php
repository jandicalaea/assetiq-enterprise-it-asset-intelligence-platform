<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotfixResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pc_name' => $this->pc_name,
            'hotfix_id' => $this->hotfix_id,
            'installed_date' => $this->installed_date?->format('Y-m-d'),
        ];
    }
}