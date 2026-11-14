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
        $inicioAgora = CarbonImmutable::now($barbearia->fuso_horario);
        $filtros = $request->validate(['periodo' => ['sometimes', 'integer', 'in:7,30,90']]);
        $periodo = (int) ($filtros['periodo'] ?? 7);
        $inicioPeriodo = $hoje->subDays($periodo - 1);
        $amanha = $hoje->addDay();
        $agenda = Agendamento::query()
            ->where('barbearia_id', $barbearia->id)
            ->where('data_hora', '>=', $hoje->format('Y-m-d H:i:s'))
            ->where('data_hora', '<', $amanha->format('Y-m-d H:i:s'))
            ->with(['cliente:id,nome,telefone', 'barbeiro:id,nome', 'servico:id,nome,preco,duracao_minutos'])
            ->orderBy('data_hora')
            ->get();
        $agendamentosPeriodo = $barbearia->agendamentos()
            ->where('data_hora', '>=', $inicioPeriodo->format('Y-m-d H:i:s'))
            ->where('data_hora', '<', $amanha->format('Y-m-d H:i:s'))
            ->with(['cliente:id,nome', 'barbeiro:id,nome', 'servico:id,nome,duracao_minutos,preco'])
            ->orderBy('data_hora')
            ->get();
        $agendaPorDia = collect(range(0, $periodo - 1))
            ->mapWithKeys(fn (int $deslocamento) => [$inicioPeriodo->addDays($deslocamento)->toDateString() => 0]);
        $receitaPorDia = $agendaPorDia->map(fn () => 0);
        foreach ($agendamentosPeriodo as $agendamentoPeriodo) {
            $dia = substr((string) $agendamentoPeriodo->getRawOriginal('data_hora'), 0, 10);
            if ($agendaPorDia->has($dia)) {
                $agendaPorDia->put($dia, $agendaPorDia->get($dia) + 1);
                if ($agendamentoPeriodo->status === StatusAgendamento::Concluido) {
                    $receitaPorDia->put($dia, $receitaPorDia->get($dia) + (int) round((float) $agendamentoPeriodo->servico->preco * 100));
                }
            }
        }

        $inicioMes = $hoje->startOfMonth();
        $inicioProximoMes = $inicioMes->addMonth();
        $agendamentosDoMes = Agendamento::query()
            ->where('barbearia_id', $barbearia->id)
            ->where('data_hora', '>=', $inicioMes)
            ->where('data_hora', '<', $inicioProximoMes)
            ->with('servico:id,preco')
            ->get(['status', 'nao_compareceu', 'servico_id']);
        $clientesDaBarbearia = $barbearia->clientes();
        $totalClientes = (clone $clientesDaBarbearia)->count();
        $novosClientesMes = (clone $clientesDaBarbearia)
            ->wherePivot('created_at', '>=', $inicioMes)
            ->wherePivot('created_at', '<', $inicioProximoMes)
            ->count();
        $faltasDoMes = $agendamentosDoMes->where('nao_compareceu', true)->count();
        $cancelamentosMes = $agendamentosDoMes
            ->where('status', StatusAgendamento::Cancelado)
            ->where('nao_compareceu', false)
            ->count();
        $cancelamentosHoje = $agenda
            ->where('status', StatusAgendamento::Cancelado)
            ->where('nao_compareceu', false)
            ->count();
        $statusPeriodo = $agendamentosPeriodo->countBy(fn (Agendamento $item) => $item->status->value);
        $receitaMesCentavos = (int) round($agendamentosDoMes
            ->where('status', StatusAgendamento::Concluido)
            ->sum(fn (Agendamento $item) => (float) $item->servico->preco * 100));
        $receitaPeriodoCentavos = (int) round($agendamentosPeriodo
            ->where('status', StatusAgendamento::Concluido)
            ->sum(fn (Agendamento $item) => (float) $item->servico->preco * 100));
        $faltasPeriodo = $agendamentosPeriodo->where('nao_compareceu', true)->count();
        $cancelamentosPeriodo = $agendamentosPeriodo
            ->where('status', StatusAgendamento::Cancelado)
            ->where('nao_compareceu', false)
            ->count();
        $servicosMaisRealizados = $agendamentosPeriodo
            ->where('status', StatusAgendamento::Concluido)
            ->groupBy('servico_id')
            ->map(fn ($itens) => [
                'nome' => $itens->first()->servico->nome,
                'quantidade' => $itens->count(),
            ])
            ->sortByDesc('quantidade')
            ->take(5)
            ->values();

        $porStatus = $agenda->countBy(fn (Agendamento $agendamento) => $agendamento->status->value);
        $profissionais = $barbearia->barbeiros()->ativos()->with(['horariosTrabalho', 'servicos:id,nome'])->get();
        $desempenhoProfissionais = $profissionais->map(function ($barbeiro) use ($agendamentosPeriodo): array {
            $atendimentos = $agendamentosPeriodo->where('barbeiro_id', $barbeiro->id);

            return [
                'id' => $barbeiro->id,
                'nome' => $barbeiro->nome,
                'concluidos' => $atendimentos->where('status', StatusAgendamento::Concluido)->count(),
                'cancelamentos' => $atendimentos->where('status', StatusAgendamento::Cancelado)->where('nao_compareceu', false)->count(),
                'faltas' => $atendimentos->where('nao_compareceu', true)->count(),
            ];
        })->sortByDesc('concluidos')->values();
        $servicos = $barbearia->servicos()->ativos()->get(['id', 'nome']);
        $proximoPorProfissional = $agenda
            ->filter(fn (Agendamento $item) => in_array($item->status, [StatusAgendamento::Pendente, StatusAgendamento::Confirmado], true)
                && (string) $item->getRawOriginal('data_hora') >= $inicioAgora->format('Y-m-d H:i:s'))
            ->groupBy('barbeiro_id')
            ->map(fn ($itens) => $itens->first());
        $semHorario = $profissionais->filter(fn ($barbeiro) => $barbeiro->horariosTrabalho->isEmpty());
        $servicosSemProfissional = $barbearia->servicos()->ativos()->doesntHave('barbeiros')->get(['id', 'nome']);
        $temHorarioDaBarbearia = $barbearia->horariosFuncionamento()->where('fechado', false)->exists();
        $proximosAgendamentos = $barbearia->agendamentos()
            ->where('data_hora', '>=', $hoje->format('Y-m-d H:i:s'))
            ->where('data_hora', '<', $hoje->addDays(8)->format('Y-m-d H:i:s'))
            ->with(['cliente:id,nome,telefone', 'barbeiro:id,nome', 'servico:id,nome,duracao_minutos'])
            ->orderBy('data_hora')
            ->get();

        return response()->json([
            'barbearia' => ['id' => $barbearia->id, 'nome' => $barbearia->nome, 'slug' => $barbearia->slug],
            'data' => $hoje->toDateString(),
            'periodo' => $periodo,
            'indicadores' => [
                'agendamentos_hoje' => $agenda->count(),
                'pendentes' => (int) ($porStatus[StatusAgendamento::Pendente->value] ?? 0),
                'concluidos' => (int) ($porStatus[StatusAgendamento::Concluido->value] ?? 0),
                'cancelados' => $cancelamentosHoje,
                'faltas' => $agenda->where('nao_compareceu', true)->count(),
                'confirmados' => (int) ($porStatus[StatusAgendamento::Confirmado->value] ?? 0),
                'clientes' => $totalClientes,
                'novos_clientes_mes' => $novosClientesMes,
                'taxa_cancelamento_mes' => $agendamentosDoMes->isEmpty()
                    ? 0
                    : round(($cancelamentosMes / $agendamentosDoMes->count()) * 100, 1),
                'taxa_faltas_mes' => $agendamentosDoMes->isEmpty()
                    ? 0
                    : round(($faltasDoMes / $agendamentosDoMes->count()) * 100, 1),
                'faltas_mes' => $faltasDoMes,
                'receita_estimada_mes_centavos' => $receitaMesCentavos,
                'receita_estimada_periodo_centavos' => $receitaPeriodoCentavos,
            ],
            'agenda' => $agenda->map(fn (Agendamento $item) => [
                'id' => $item->id,
                'inicio' => $item->data_hora->format('H:i'),
                'fim' => $item->data_hora->addMinutes($item->servico->duracao_minutos)->format('H:i'),
                'status' => $item->status->value,
                'nao_compareceu' => (bool) $item->nao_compareceu,
                'cliente' => ['nome' => $item->cliente->nome, 'telefone' => $item->cliente->telefone],
                'profissional' => ['nome' => $item->barbeiro->nome],
                'servico' => ['nome' => $item->servico->nome, 'preco' => $item->servico->preco],
            ])->values(),
            'profissionais' => $profissionais->map(fn ($barbeiro) => [
                'id' => $barbeiro->id,
                'nome' => $barbeiro->nome,
                'agendamentos_hoje' => $agenda->where('barbeiro_id', $barbeiro->id)->count(),
                'concluidos_hoje' => $agenda->where('barbeiro_id', $barbeiro->id)->where('status', StatusAgendamento::Concluido)->count(),
                'proximo_atendimento' => ($proximo = $proximoPorProfissional->get($barbeiro->id)) ? $proximo->data_hora->format('H:i') : null,
                'jornada_configurada' => $barbeiro->horariosTrabalho->isNotEmpty(),
                    'servicos' => $barbeiro->servicos->map(fn ($servico) => ['id' => $servico->id, 'nome' => $servico->nome])->values(),
            ])->values(),
            'analiticos' => [
                'agendamentos_por_dia' => $agendaPorDia->map(fn (int $quantidade, string $data) => ['data' => $data, 'quantidade' => $quantidade])->values(),
                'receita_estimada_por_dia' => $receitaPorDia->map(fn (int $centavos, string $data) => ['data' => $data, 'centavos' => $centavos])->values(),
                'servicos_mais_realizados' => $servicosMaisRealizados,
                'desempenho_profissionais' => $desempenhoProfissionais,
                'status' => collect(StatusAgendamento::cases())
                    ->reject(fn (StatusAgendamento $status) => $status === StatusAgendamento::Cancelado)
                    ->map(fn (StatusAgendamento $status) => [
                        'status' => $status->value,
                        'quantidade' => (int) ($statusPeriodo[$status->value] ?? 0),
                    ])
                    ->values()
                    ->push(['status' => 'cancelado', 'quantidade' => $cancelamentosPeriodo])
                    ->push(['status' => 'nao_compareceu', 'quantidade' => $faltasPeriodo])
                    ->values(),
                'nao_comparecimentos' => $faltasPeriodo,
            ],
            'proximos_agendamentos' => $proximosAgendamentos->map(fn (Agendamento $item) => [
                'id' => $item->id,
                'data' => substr((string) $item->getRawOriginal('data_hora'), 0, 10),
                'inicio' => $item->data_hora->format('H:i'),
                'status' => $item->status->value,
                'nao_compareceu' => (bool) $item->nao_compareceu,
                'cliente' => ['nome' => $item->cliente->nome, 'telefone' => $item->cliente->telefone],
                'profissional' => ['nome' => $item->barbeiro->nome],
                'servico' => ['nome' => $item->servico->nome],
            ])->values(),
            'servicos' => $servicos->map(fn ($servico) => ['id' => $servico->id, 'nome' => $servico->nome])->values(),
            'alertas' => collect([
                ! $temHorarioDaBarbearia ? ['tipo' => 'configuracao', 'mensagem' => 'Cadastre o horário de funcionamento da barbearia para abrir novos horários.'] : null,
                ...$semHorario->map(fn ($barbeiro) => ['tipo' => 'configuracao', 'mensagem' => "{$barbeiro->nome} não possui jornada de trabalho configurada."])->all(),
                ...$servicosSemProfissional->map(fn ($servico) => ['tipo' => 'configuracao', 'mensagem' => "{$servico->nome} não possui profissional habilitado."])->all(),
            ])->filter()->values(),
            'limites' => [
                'financeiro' => 'A receita é estimada pelo preço atual dos serviços concluídos. Pagamentos e custos não são registrados, então o lucro líquido não pode ser calculado.',
            ],
        ]);
    }
}
