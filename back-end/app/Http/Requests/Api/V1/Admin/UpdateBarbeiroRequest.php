<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBarbeiroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $barbeariaId = $this->route('barbearia')?->id;
        $barbeiroId = $this->route('barbeiro')?->id;

        return [
            'nome' => ['required', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('barbeiros', 'email')->where('barbearia_id', $barbeariaId)->ignore($barbeiroId)],
            'ativo' => ['required', 'boolean'],
            'servico_ids' => ['required', 'array'],
            'servico_ids.*' => ['required', 'integer', Rule::exists('servicos', 'id')->where('barbearia_id', $barbeariaId)],
        ];
    }
}
