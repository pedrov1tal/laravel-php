<?php

namespace App\Models;

use App\Enums\StatusAgendamento;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Agendamento extends Model
{
    protected $fillable = [
        'barbearia_id',
        'cliente_id',
        'barbeiro_id',
        'servico_id',
        'data_hora',
        'status',
        'cancelado_por_user_id',
        'cancelado_em',
        'motivo_cancelamento',
        'observacoes',
    ];

    protected $casts = [
        'data_hora' => 'datetime',
        'status' => StatusAgendamento::class,
        'cancelado_em' => 'datetime',
    ];

    public function barbearia(): BelongsTo
    {
        return $this->belongsTo(Barbearia::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function barbeiro(): BelongsTo
    {
        return $this->belongsTo(Barbeiro::class);
    }

    public function servico(): BelongsTo
    {
        return $this->belongsTo(Servico::class);
    }

    public function canceladoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelado_por_user_id');
    }
}
