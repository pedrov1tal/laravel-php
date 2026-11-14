<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateBarbeariaHorariosRequest;
use App\Http\Requests\Api\V1\Admin\UpdateBarbeariaRequest;
use App\Models\Barbearia;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ConfiguracaoController extends Controller
{
    public function show(Barbearia $barbearia): JsonResponse
    {
        $barbearia->loadMissing('horariosFuncionamento');

        return response()->json([
            'barbearia' => $barbearia->only([
                'slug', 'nome', 'descricao', 'telefone', 'email', 'endereco',
                'cor_primaria', 'cor_destaque', 'fuso_horario', 'antecedencia_cancelamento_minutos',
            ]),
            'horarios' => collect(range(0, 6))->map(function (int $dia) use ($barbearia): array {
                $horario = $barbearia->horariosFuncionamento->firstWhere('dia_semana', $dia);

                return [
                    'dia_semana' => $dia,
                    'fechado' => $horario?->fechado ?? true,
                    'abre_as' => $horario?->abre_as ? substr((string) $horario->abre_as, 0, 5) : null,
                    'fecha_as' => $horario?->fecha_as ? substr((string) $horario->fecha_as, 0, 5) : null,
                ];
            })->values(),
        ]);
    }

    public function update(UpdateBarbeariaRequest $request, Barbearia $barbearia): JsonResponse
    {
        $dados = $request->validated();
        $horarios = $dados['horarios'] ?? null;
        unset($dados['horarios']);
        DB::transaction(function () use ($barbearia, $dados, $horarios): void {
            $barbearia->update($dados);
            if ($horarios !== null) {
                $this->salvarHorarios($barbearia, $horarios);
            }
        });

        return $this->show($barbearia->refresh());
    }

    public function horarios(UpdateBarbeariaHorariosRequest $request, Barbearia $barbearia): JsonResponse
    {
        DB::transaction(fn () => $this->salvarHorarios($barbearia, $request->validated('horarios')));

        return $this->show($barbearia->refresh());
    }

    /** @param array<int, array{dia_semana:int,fechado:bool|string,abre_as:?string,fecha_as:?string}> $horarios */
    private function salvarHorarios(Barbearia $barbearia, array $horarios): void
    {
        foreach ($horarios as $horario) {
            $fechado = filter_var($horario['fechado'], FILTER_VALIDATE_BOOLEAN);
            $barbearia->horariosFuncionamento()->updateOrCreate(
                ['dia_semana' => $horario['dia_semana']],
                [
                    'fechado' => $fechado,
                    'abre_as' => $fechado ? null : $horario['abre_as'],
                    'fecha_as' => $fechado ? null : $horario['fecha_as'],
                ],
            );
        }
    }
}
