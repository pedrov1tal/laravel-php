<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\StatusAgendamento;
use App\Models\Barbearia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgendamentoRequest extends FormRequest
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
            'cliente_id' => [
                'required', 'integer',
                Rule::exists('barbearia_cliente', 'cliente_id')->where('barbearia_id', $barbearia?->id),
            ],
            'barbeiro_id' => [
                'required', 'integer',
                Rule::exists('barbeiros', 'id')->where('barbearia_id', $barbearia?->id)->where('ativo', true),
            ],
            'servico_id' => [
                'required', 'integer',
                Rule::exists('servicos', 'id')->where('barbearia_id', $barbearia?->id)->where('ativo', true),
            ],
            'data_hora' => ['required', 'date_format:Y-m-d H:i'],
            'status' => ['required', Rule::in([StatusAgendamento::Pendente->value, StatusAgendamento::Confirmado->value])],
            'observacoes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
