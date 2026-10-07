<?php

namespace App\Console\Commands;

use App\Models\Barbearia;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\Console\Command\Command as SymfonyCommand;
use Throwable;

class ProvisionarBarbearia extends Command
{
    protected $signature = 'barbearia:provisionar';

    protected $description = 'Cria uma barbearia e sua primeira conta administradora';

    public function handle(): int
    {
        $nomeBarbearia = trim((string) $this->ask('Nome da barbearia'));
        $slugSugerido = Str::slug($nomeBarbearia);
        $slug = trim((string) $this->ask('Slug público', $slugSugerido));
        $telefoneBarbearia = $this->opcional('Telefone da barbearia');
        $emailBarbearia = $this->opcional('E-mail público da barbearia');
        $endereco = $this->opcional('Endereço da barbearia');
        $nomeAdministrador = trim((string) $this->ask('Nome do administrador'));
        $emailAdministrador = strtolower(trim((string) $this->ask('E-mail do administrador')));
        $senha = (string) $this->secret('Senha temporária do administrador');
        $confirmacaoSenha = (string) $this->secret('Confirme a senha temporária');

        $dados = [
            'nome_barbearia' => $nomeBarbearia,
            'slug' => $slug,
            'telefone_barbearia' => $telefoneBarbearia,
            'email_barbearia' => $emailBarbearia,
            'endereco' => $endereco,
            'nome_administrador' => $nomeAdministrador,
            'email_administrador' => $emailAdministrador,
            'senha' => $senha,
            'senha_confirmation' => $confirmacaoSenha,
        ];

        $validator = Validator::make($dados, [
            'nome_barbearia' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'alpha_dash:ascii', 'max:255', 'unique:barbearias,slug'],
            'telefone_barbearia' => ['nullable', 'string', 'max:30'],
            'email_barbearia' => ['nullable', 'email', 'max:255'],
            'endereco' => ['nullable', 'string', 'max:255'],
            'nome_administrador' => ['required', 'string', 'max:255'],
            'email_administrador' => ['required', 'email', 'max:255', 'unique:users,email'],
            'senha' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $erro) {
                $this->error($erro);
            }

            return SymfonyCommand::FAILURE;
        }

        try {
            DB::transaction(function () use ($dados): void {
                $barbearia = Barbearia::query()->create([
                    'nome' => $dados['nome_barbearia'],
                    'slug' => $dados['slug'],
                    'telefone' => $dados['telefone_barbearia'],
                    'email' => $dados['email_barbearia'],
                    'endereco' => $dados['endereco'],
                ]);

                $administrador = User::query()->create([
                    'name' => $dados['nome_administrador'],
                    'email' => $dados['email_administrador'],
                    'password' => Hash::make($dados['senha']),
                    'deve_trocar_senha' => true,
                ]);

                $barbearia->administradores()->attach($administrador);
            });
        } catch (Throwable $erro) {
            report($erro);
            $this->error('Não foi possível provisionar a barbearia. Consulte os logs da aplicação.');

            return SymfonyCommand::FAILURE;
        }

        $this->info('Barbearia e administrador criados com sucesso.');
        $this->warn('O administrador deverá trocar a senha temporária no primeiro acesso.');

        return SymfonyCommand::SUCCESS;
    }

    private function opcional(string $pergunta): ?string
    {
        $valor = trim((string) $this->ask($pergunta));

        return $valor === '' ? null : $valor;
    }
}
