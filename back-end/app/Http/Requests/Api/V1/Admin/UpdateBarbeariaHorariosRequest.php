<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateBarbeariaHorariosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'horarios' => ['required', 'array', 'size:7'],
            'horarios.*.dia_semana' => ['required', 'integer', 'between:0,6', 'distinct'],
            'horarios.*.fechado' => ['required', 'boolean'],
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
