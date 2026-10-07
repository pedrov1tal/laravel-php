<?php

namespace App\Policies;

use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Models\User;
use App\Policies\Concerns\VerificaVinculoBarbearia;
use Illuminate\Auth\Access\Response;

class AgendamentoPolicy
{
    use VerificaVinculoBarbearia;

    public function view(User $usuario, Agendamento $agendamento): Response
    {
        return $this->autorizarParticipante($usuario, $agendamento);
    }

    public function create(User $usuario, Barbearia $barbearia): Response
    {
        if (! $barbearia->ativa) {
            return Response::denyAsNotFound();
        }

        return $usuario->cliente()->exists()
            ? Response::allow()
            : Response::deny('Cadastre o perfil de cliente para agendar.');
    }

    public function cancelar(User $usuario, Agendamento $agendamento): Response
    {
        return $this->autorizarParticipante($usuario, $agendamento);
    }

    public function concluir(User $usuario, Agendamento $agendamento): Response
    {
        if ($agendamento->barbeiro?->user_id === $usuario->getKey()) {
            return Response::allow();
        }

        return $this->autorizarAdministrador($usuario, $agendamento->barbearia);
    }

    public function delete(User $usuario, Agendamento $agendamento): Response
    {
        return Response::deny('Agendamentos devem ser cancelados, não excluídos.');
    }

    private function autorizarParticipante(User $usuario, Agendamento $agendamento): Response
    {
        if ($agendamento->cliente?->user_id === $usuario->getKey()) {
            return Response::allow();
        }

        if ($agendamento->barbeiro?->user_id === $usuario->getKey()) {
            return Response::allow();
        }

        return $this->autorizarAdministrador($usuario, $agendamento->barbearia);
    }
}
