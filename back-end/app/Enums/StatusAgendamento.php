<?php

namespace App\Enums;

enum StatusAgendamento: string
{
    case Pendente = 'pendente';
    case Confirmado = 'confirmado';
    case Cancelado = 'cancelado';
    case Concluido = 'concluido';

    /**
     * @return list<string>
     */
    public static function valores(): array
    {
        return array_column(self::cases(), 'value');
    }
}
