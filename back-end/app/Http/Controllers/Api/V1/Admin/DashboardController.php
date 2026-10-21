<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StatusAgendamento;
use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Barbearia;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(Request $request, Barbearia $barbearia): JsonResponse
    {
        $hoje = CarbonImmutable::now($barbearia->fuso_horario)->startOfDay();
        $amanha = $hoje->addDay();
        $agenda = Agendamento::query()
            ->where('barbearia_id', $barbearia->id)
            ->whereBetween('data_hora', [$hoje, $amanha])
            ->with(['cliente:id,nome,telefone', 'barbeiro:id,nome', 'servico:id,nome,preco,duracao_minutos'])
            ->orderBy('data_hora')
            ->get();

        $porStatus = $agenda->countBy(fn (Agendamento $agendamento) => $agendamento->status->value);
        $profissionais = $barbearia->barbeiros()->ativos()->with('horariosTrabalho')->get();
        $proximoPorProfissional = $agenda
            ->whereNotIn('status', [StatusAgendamento::Cancelado])
            ->groupBy('barbeiro_id')
            ->map(fn ($itens) => $itens->first());
        $semHorario = $profissionais->filter(fn ($barbeiro) => $barbeiro->horariosTrabalho->isEmpty());
        $servicosSemProfissional = $barbearia->servicos()->ativos()->doesntHave('barbeiros')->get(['id', 'nome']);
        $temHorarioDaBarbearia = $barbearia->horariosFuncionamento()->where('fechado', false)->exists();

        return response()->json([
            'barbearia' => ['id' => $barbearia->id, 'nome' => $barbearia->nome, 'slug' => $barbearia->slug],
            'data' => $hoje->toDateString(),
            'indicadores' => [
                'agendamentos_hoje' => $agenda->count(),
                'pendentes' => (int) ($porStatus[StatusAgendamento::Pendente->value] ?? 0),
                'concluidos' => (int) ($porStatus[StatusAgendamento::Concluido->value] ?? 0),
                'cancelados' => (int) ($porStatus[StatusAgendamento::Cancelado->value] ?? 0),
            ],
            'agenda' => $agenda->map(fn (Agendamento $item) => [
                'id' => $item->id,
                'inicio' => $item->data_hora->setTimezone($barbearia->fuso_horario)->format('H:i'),
                'fim' => $item->data_hora->setTimezone($barbearia->fuso_horario)->addMinutes($item->servico->duracao_minutos)->format('H:i'),
                'status' => $item->status->value,
                'cliente' => ['nome' => $item->cliente->nome, 'telefone' => $item->cliente->telefone],
                'profissional' => ['nome' => $item->barbeiro->nome],
                'servico' => ['nome' => $item->servico->nome, 'preco' => $item->servico->preco],
            ])->values(),
            'profissionais' => $profissionais->map(fn ($barbeiro) => [
                'id' => $barbeiro->id,
                'nome' => $barbeiro->nome,
                'agendamentos_hoje' => $agenda->where('barbeiro_id', $barbeiro->id)->count(),
                'concluidos_hoje' => $agenda->where('barbeiro_id', $barbeiro->id)->where('status', StatusAgendamento::Concluido)->count(),
                'proximo_atendimento' => ($proximo = $proximoPorProfissional->get($barbeiro->id)) ? $proximo->data_hora->setTimezone($barbearia->fuso_horario)->format('H:i') : null,
                'jornada_configurada' => $barbeiro->horariosTrabalho->isNotEmpty(),
            ])->values(),
            'alertas' => collect([
                ! $temHorarioDaBarbearia ? ['tipo' => 'configuracao', 'mensagem' => 'Cadastre o horário de funcionamento da barbearia para abrir novos horários.'] : null,
                ...$semHorario->map(fn ($barbeiro) => ['tipo' => 'configuracao', 'mensagem' => "{$barbeiro->nome} não possui jornada de trabalho configurada."])->all(),
                ...$servicosSemProfissional->map(fn ($servico) => ['tipo' => 'configuracao', 'mensagem' => "{$servico->nome} não possui profissional habilitado."])->all(),
            ])->filter()->values(),
            'limites' => ['financeiro' => 'O sistema ainda não registra pagamentos; valores de faturamento não são exibidos.'],
        ]);
    }
}
