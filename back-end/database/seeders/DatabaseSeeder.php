<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\User;
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
    }
}
