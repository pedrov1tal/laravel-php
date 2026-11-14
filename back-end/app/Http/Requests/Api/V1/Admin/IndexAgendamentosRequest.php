<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\StatusAgendamento;
use App\Models\Barbearia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexAgendamentosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        /** @var Barbearia|null $barbearia */
        $barbearia = $this->route('barbearia');

        return [
            'data_inicio' => ['nullable', 'date_format:Y-m-d'],
            'data_fim' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:data_inicio'],
            'status' => ['nullable', Rule::in(StatusAgendamento::valores())],
            'barbeiro_id' => [
                'nullable', 'integer',
                Rule::exists('barbeiros', 'id')->where('barbearia_id', $barbearia?->id),
            ],
            'busca' => ['nullable', 'string', 'max:120'],
        ];
    }
}
