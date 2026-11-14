<?php

namespace Database\Seeders;

use App\Enums\StatusAgendamento;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Models\BarbeariaHorario;
use App\Models\Barbeiro;
use App\Models\BarbeiroHorario;
use App\Models\Cliente;
use App\Models\Servico;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $usuario = User::query()->updateOrCreate([
            'email' => 'ana@exemplo.com',
        ], [
            'name' => 'Ana Martins',
            'password' => Hash::make('senha123'),
            'deve_trocar_senha' => false,
        ]);

        Cliente::query()->updateOrCreate([
            'email' => 'ana@exemplo.com',
        ], [
            'user_id' => $usuario->getKey(),
            'nome' => 'Ana Martins',
            'telefone' => '(11) 99999-0000',
        ]);

        $administrador = User::query()->updateOrCreate([
            'email' => 'admin@exemplo.com',
        ], [
            'name' => 'Administrador de Teste',
            'password' => Hash::make('senha123'),
            'deve_trocar_senha' => false,
        ]);

        $barbearia = Barbearia::query()->updateOrCreate([
            'slug' => 'barbearia-teste',
        ], [
            'nome' => 'Barbearia de Teste',
            'descricao' => 'Unidade de demonstração para testar agendamentos e gestão.',
            'telefone' => '(11) 3333-2026',
            'email' => 'contato@barbearia-teste.local',
            'endereco' => 'Rua das Navalhas, 120 - São Paulo, SP',
            'fuso_horario' => 'America/Sao_Paulo',
            'ativa' => true,
        ]);

        $barbearia->administradores()->syncWithoutDetaching([$administrador->getKey()]);

        $cliente = Cliente::query()->where('email', 'ana@exemplo.com')->firstOrFail();
        $barbearia->clientes()->syncWithoutDetaching([$cliente->getKey()]);

        $servicos = collect([
            ['nome' => 'Corte tradicional', 'descricao' => 'Corte na tesoura ou máquina.', 'duracao_minutos' => 45, 'preco' => 45.00],
            ['nome' => 'Barba completa', 'descricao' => 'Modelagem e acabamento de barba.', 'duracao_minutos' => 30, 'preco' => 35.00],
            ['nome' => 'Corte e barba', 'descricao' => 'Corte tradicional com barba completa.', 'duracao_minutos' => 75, 'preco' => 70.00],
        ])->map(fn (array $dados) => Servico::query()->updateOrCreate(
            ['barbearia_id' => $barbearia->getKey(), 'nome' => $dados['nome']],
            [...$dados, 'ativo' => true],
        ));

        $barbeiro = Barbeiro::query()->updateOrCreate([
            'barbearia_id' => $barbearia->getKey(),
            'email' => 'joao@barbearia-teste.local',
        ], [
            'nome' => 'João Silva',
            'telefone' => '(11) 98888-2026',
            'ativo' => true,
        ]);
        $barbeiro->servicos()->syncWithoutDetaching($servicos->pluck('id')->all());

        foreach (range(0, 6) as $diaSemana) {
            $fechado = $diaSemana === 0;
            BarbeariaHorario::query()->updateOrCreate([
                'barbearia_id' => $barbearia->getKey(),
                'dia_semana' => $diaSemana,
            ], [
                'abre_as' => $fechado ? null : '09:00',
                'fecha_as' => $fechado ? null : '18:00',
                'fechado' => $fechado,
            ]);

            BarbeiroHorario::query()->updateOrCreate([
                'barbeiro_id' => $barbeiro->getKey(),
                'dia_semana' => $diaSemana,
            ], [
                'inicia_as' => $fechado ? null : '09:00',
                'termina_as' => $fechado ? null : '18:00',
                'pausa_inicio' => $fechado ? null : '12:00',
                'pausa_fim' => $fechado ? null : '13:00',
                'indisponivel' => $fechado,
            ]);
        }

        $agora = CarbonImmutable::now($barbearia->fuso_horario);
        Agendamento::query()->updateOrCreate([
            'barbearia_id' => $barbearia->getKey(),
            'observacoes' => 'Demonstração: atendimento concluído',
        ], [
            'cliente_id' => $cliente->getKey(),
            'barbeiro_id' => $barbeiro->getKey(),
            'servico_id' => $servicos->firstWhere('nome', 'Corte tradicional')->getKey(),
            'data_hora' => $agora->subDays(2)->setTime(10, 0),
            'status' => StatusAgendamento::Concluido,
            'nao_compareceu' => false,
        ]);

        $proximoDia = $agora->addDay();
        while ($proximoDia->dayOfWeek === 0) {
            $proximoDia = $proximoDia->addDay();
        }
        Agendamento::query()->updateOrCreate([
            'barbearia_id' => $barbearia->getKey(),
            'observacoes' => 'Demonstração: atendimento confirmado',
        ], [
            'cliente_id' => $cliente->getKey(),
            'barbeiro_id' => $barbeiro->getKey(),
            'servico_id' => $servicos->firstWhere('nome', 'Barba completa')->getKey(),
            'data_hora' => $proximoDia->setTime(10, 0),
            'status' => StatusAgendamento::Confirmado,
            'nao_compareceu' => false,
        ]);
    }
}
