<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBarbeiroAusenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'inicio_em' => ['required', 'date_format:Y-m-d H:i'],
            'fim_em' => ['required', 'date_format:Y-m-d H:i', 'after:inicio_em'],
            'motivo' => ['nullable', 'string', 'max:255'],
        ];
    }
}
