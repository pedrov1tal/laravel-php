<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreBarbeiroAusenciaRequest;
use App\Http\Requests\Api\V1\Admin\StoreBarbeiroRequest;
use App\Http\Requests\Api\V1\Admin\UpdateBarbeiroJornadaRequest;
use App\Http\Requests\Api\V1\Admin\UpdateBarbeiroRequest;
use App\Http\Resources\Api\V1\BarbeiroResource;
use App\Models\Barbearia;
use App\Models\Barbeiro;
use App\Models\BarbeiroAusencia;
use App\Enums\StatusAgendamento;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class BarbeiroController extends Controller
{
    public function index(Barbearia $barbearia): AnonymousResourceCollection
    {
        return BarbeiroResource::collection(
            $barbearia->barbeiros()->with(['servicos', 'horariosTrabalho', 'ausencias'])->orderBy('nome')->paginate(20),
        );
    }

    public function show(Barbearia $barbearia, Barbeiro $barbeiro): BarbeiroResource
    {
        abort_unless($barbeiro->barbearia_id === $barbearia->id, 404);

        $barbeiro->load([
            'servicos',
            'horariosTrabalho',
            'ausencias',
            'agendamentos' => fn ($query) => $query
                ->where('barbearia_id', $barbearia->id)
                ->with(['cliente:id,nome', 'servico:id,nome', 'barbeiro:id,nome'])
                ->latest('data_hora')
                ->limit(50),
        ]);

        return new BarbeiroResource($barbeiro);
    }

    public function store(StoreBarbeiroRequest $request, Barbearia $barbearia): JsonResponse
    {
        $dados = $request->validated();
        $servicoIds = $dados['servico_ids'] ?? [];
        unset($dados['servico_ids']);
        $barbeiro = $barbearia->barbeiros()->create($dados);
        $barbeiro->servicos()->sync($servicoIds);

        return response()->json((new BarbeiroResource($barbeiro->load('servicos')))->resolve($request), 201);
    }

    public function update(UpdateBarbeiroRequest $request, Barbearia $barbearia, Barbeiro $barbeiro): JsonResponse
    {
        abort_unless($barbeiro->barbearia_id === $barbearia->id, 404);
        $dados = $request->validated();
        $servicoIds = $dados['servico_ids'];
        unset($dados['servico_ids']);
        $barbeiro->update($dados);
        $barbeiro->servicos()->sync($servicoIds);

        return response()->json((new BarbeiroResource($barbeiro->refresh()->load(['servicos', 'horariosTrabalho', 'ausencias'])))->resolve($request));
    }

    public function jornada(UpdateBarbeiroJornadaRequest $request, Barbearia $barbearia, Barbeiro $barbeiro): JsonResponse
    {
        abort_unless($barbeiro->barbearia_id === $barbearia->id, 404);
        DB::transaction(function () use ($request, $barbeiro): void {
            foreach ($request->validated('horarios') as $horario) {
                $fechado = (bool) $horario['indisponivel'];
                $barbeiro->horariosTrabalho()->updateOrCreate(
                    ['dia_semana' => $horario['dia_semana']],
                    [
                        'indisponivel' => $fechado,
                        'inicia_as' => $fechado ? null : $horario['inicia_as'],
                        'termina_as' => $fechado ? null : $horario['termina_as'],
                        'pausa_inicio' => $fechado ? null : ($horario['pausa_inicio'] ?? null),
                        'pausa_fim' => $fechado ? null : ($horario['pausa_fim'] ?? null),
                    ],
                );
            }
        });

        return response()->json((new BarbeiroResource($barbeiro->load(['servicos', 'horariosTrabalho', 'ausencias'])))->resolve($request));
    }

    public function storeAusencia(StoreBarbeiroAusenciaRequest $request, Barbearia $barbearia, Barbeiro $barbeiro): JsonResponse
    {
        abort_unless($barbeiro->barbearia_id === $barbearia->id, 404);
        $dados = $request->validated();
        $conflito = $barbeiro->agendamentos()
            ->whereIn('status', [StatusAgendamento::Pendente->value, StatusAgendamento::Confirmado->value])
            ->where('data_hora', '<', $dados['fim_em'])
            ->whereRaw("datetime(data_hora, '+' || (select duracao_minutos from servicos where servicos.id = agendamentos.servico_id) || ' minutes') > ?", [$dados['inicio_em']])
            ->exists();

        if ($conflito) {
            return response()->json(['message' => 'Há agendamentos ativos nesse período. Reorganize a agenda antes de registrar a ausência.'], 409);
        }

        $ausencia = $barbeiro->ausencias()->create($dados);

        return response()->json([
            'id' => $ausencia->id,
            'inicio_em' => $ausencia->getRawOriginal('inicio_em'),
            'fim_em' => $ausencia->getRawOriginal('fim_em'),
            'motivo' => $ausencia->motivo,
        ], 201);
    }

    public function destroyAusencia(Request $request, Barbearia $barbearia, Barbeiro $barbeiro, BarbeiroAusencia $ausencia): JsonResponse
    {
        abort_unless($barbeiro->barbearia_id === $barbearia->id && $ausencia->barbeiro_id === $barbeiro->id, 404);
        $ausencia->delete();

        return response()->json(['message' => 'Ausência removida.']);
    }
}
