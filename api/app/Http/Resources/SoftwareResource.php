<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SoftwareResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pc_name' => $this->pc_name,
            'name' => $this->name,
            'version' => $this->version,
            'category' => $this->category,
        ];
    }
}