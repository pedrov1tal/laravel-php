<?php

namespace App\Policies;

use App\Models\Barbearia;
use App\Models\Barbeiro;
use App\Models\User;
use App\Policies\Concerns\VerificaVinculoBarbearia;
use Illuminate\Auth\Access\Response;

class BarbeiroPolicy
{
    use VerificaVinculoBarbearia;

    public function view(?User $usuario, Barbeiro $barbeiro): bool
    {
        if ($barbeiro->ativo) {
            return true;
        }

        return $usuario?->barbeariasAdministradas()
            ->whereKey($barbeiro->barbearia_id)
            ->exists() ?? false;
    }

    public function create(User $usuario, Barbearia $barbearia): Response
    {
        return $this->autorizarAdministrador($usuario, $barbearia);
    }

    public function update(User $usuario, Barbeiro $barbeiro): Response
    {
        return $this->autorizarAdministrador($usuario, $barbeiro->barbearia);
    }

    public function delete(User $usuario, Barbeiro $barbeiro): Response
    {
        return $this->autorizarAdministrador($usuario, $barbeiro->barbearia);
    }
}
