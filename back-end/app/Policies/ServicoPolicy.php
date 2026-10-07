<?php

namespace App\Policies;

use App\Models\Barbearia;
use App\Models\Servico;
use App\Models\User;
use App\Policies\Concerns\VerificaVinculoBarbearia;
use Illuminate\Auth\Access\Response;

class ServicoPolicy
{
    use VerificaVinculoBarbearia;

    public function view(?User $usuario, Servico $servico): bool
    {
        if ($servico->ativo) {
            return true;
        }

        return $usuario?->barbeariasAdministradas()
            ->whereKey($servico->barbearia_id)
            ->exists() ?? false;
    }

    public function create(User $usuario, Barbearia $barbearia): Response
    {
        return $this->autorizarAdministrador($usuario, $barbearia);
    }

    public function update(User $usuario, Servico $servico): Response
    {
        return $this->autorizarAdministrador($usuario, $servico->barbearia);
    }

    public function delete(User $usuario, Servico $servico): Response
    {
        return $this->autorizarAdministrador($usuario, $servico->barbearia);
    }
}
