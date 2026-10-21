<?php

namespace App\Http\Requests\Api\V1\Agendamento;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgendamentoRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'data_hora' => is_string($this->data_hora) ? trim($this->data_hora) : $this->data_hora,
            'observacoes' => is_string($this->observacoes) ? trim($this->observacoes) : $this->observacoes,
        ]);
    }

    public function rules(): array
    {
        return [
            'servico_id' => ['required', 'integer', 'exists:servicos,id'],
            'barbeiro_id' => ['required', 'integer', 'exists:barbeiros,id'],
            'data_hora' => ['required', 'date_format:Y-m-d H:i'],
            'observacoes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
