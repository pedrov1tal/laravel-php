<?php

namespace App\Policies\Concerns;

use App\Models\Barbearia;
use App\Models\User;
use Illuminate\Auth\Access\Response;

trait VerificaVinculoBarbearia
{
    private function autorizarAdministrador(User $usuario, Barbearia $barbearia): Response
    {
        if ($usuario->barbeariasAdministradas()->whereKey($barbearia->getKey())->exists()) {
            return Response::allow();
        }

        if ($usuario->barbeariasAdministradas()->exists()) {
            return Response::denyAsNotFound();
        }

        return Response::deny('Acesso restrito a administradores.');
    }

    private function autorizarBarbeiro(User $usuario, Barbearia $barbearia): Response
    {
        if ($usuario->perfisBarbeiro()
            ->where('barbearia_id', $barbearia->getKey())
            ->where('ativo', true)
            ->exists()) {
            return Response::allow();
        }

        if ($usuario->perfisBarbeiro()->where('ativo', true)->exists()) {
            return Response::denyAsNotFound();
        }

        return Response::deny('Acesso restrito a barbeiros.');
    }
}
