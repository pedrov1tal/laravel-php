<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateBarbeiroJornadaRequest extends FormRequest
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
            'horarios.*.indisponivel' => ['required', 'boolean'],
            'horarios.*.inicia_as' => ['nullable', 'date_format:H:i'],
            'horarios.*.termina_as' => ['nullable', 'date_format:H:i'],
            'horarios.*.pausa_inicio' => ['nullable', 'date_format:H:i'],
            'horarios.*.pausa_fim' => ['nullable', 'date_format:H:i'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach ($this->input('horarios', []) as $indice => $horario) {
                if (($horario['indisponivel'] ?? false) === true || ($horario['indisponivel'] ?? null) === '1') {
                    continue;
                }

                $inicio = $horario['inicia_as'] ?? null;
                $fim = $horario['termina_as'] ?? null;
                if (! $inicio || ! $fim || $inicio >= $fim) {
                    $validator->errors()->add("horarios.{$indice}.inicia_as", 'Informe um período de trabalho válido.');
                    continue;
                }

                $pausaInicio = $horario['pausa_inicio'] ?? null;
                $pausaFim = $horario['pausa_fim'] ?? null;
                if (($pausaInicio && ! $pausaFim) || (! $pausaInicio && $pausaFim)
                    || ($pausaInicio && $pausaFim && ($pausaInicio >= $pausaFim || $pausaInicio < $inicio || $pausaFim > $fim))) {
                    $validator->errors()->add("horarios.{$indice}.pausa_inicio", 'A pausa deve ficar dentro do período de trabalho.');
                }
            }
        }];
    }
}
