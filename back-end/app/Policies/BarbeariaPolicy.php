<?php

namespace App\Policies;

use App\Models\Barbearia;
use App\Models\User;
use App\Policies\Concerns\VerificaVinculoBarbearia;
use Illuminate\Auth\Access\Response;

class BarbeariaPolicy
{
    use VerificaVinculoBarbearia;

    public function view(?User $usuario, Barbearia $barbearia): bool
    {
        return $barbearia->ativa;
    }

    public function update(User $usuario, Barbearia $barbearia): Response
    {
        return $this->autorizarAdministrador($usuario, $barbearia);
    }
}
