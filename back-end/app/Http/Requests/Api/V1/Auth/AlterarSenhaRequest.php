<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class AlterarSenhaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'senha_atual' => ['required', 'string'],
            'nova_senha' => ['required', 'string', 'min:8', 'different:senha_atual', 'confirmed'],
        ];
    }
}
