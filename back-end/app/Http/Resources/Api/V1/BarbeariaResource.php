<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarbeariaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'slug' => $this->slug,
            'nome' => $this->nome,
            'descricao' => $this->descricao ?? '',
            'endereco' => $this->endereco ?? '',
            'telefone' => $this->telefone ?? '',
        ];
    }
}
