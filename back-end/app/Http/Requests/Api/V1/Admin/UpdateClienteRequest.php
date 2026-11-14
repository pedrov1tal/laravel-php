<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'observacoes_internas' => ['nullable', 'string', 'max:5000'],
            'bloqueado' => ['required', 'boolean'],
        ];
    }
}
