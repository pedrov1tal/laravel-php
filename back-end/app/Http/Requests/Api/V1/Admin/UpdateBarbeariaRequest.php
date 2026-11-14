<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateBarbeariaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:3000'],
            'telefone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'endereco' => ['nullable', 'string', 'max:500'],
            'cor_primaria' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'cor_destaque' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'fuso_horario' => ['required', 'timezone'],
            'antecedencia_cancelamento_minutos' => ['required', 'integer', 'between:0,10080'],
            'horarios' => ['sometimes', 'required', 'array', 'size:7'],
            'horarios.*.dia_semana' => ['required_with:horarios', 'integer', 'between:0,6', 'distinct'],
            'horarios.*.fechado' => ['required_with:horarios', 'boolean'],
            'horarios.*.abre_as' => ['nullable', 'date_format:H:i'],
            'horarios.*.fecha_as' => ['nullable', 'date_format:H:i'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach ($this->input('horarios', []) as $indice => $horario) {
                if (filter_var($horario['fechado'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
                    continue;
                }
                $abre = $horario['abre_as'] ?? null;
                $fecha = $horario['fecha_as'] ?? null;
                if (! $abre || ! $fecha || $abre >= $fecha) {
                    $validator->errors()->add("horarios.{$indice}.abre_as", 'Informe um intervalo válido para o funcionamento.');
                }
            }
        }];
    }
}
