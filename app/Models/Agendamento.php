<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Agendamento extends Model
{
    protected $fillable = [
        'cliente_id',
        'barbeiro_id',
        'servico_id',
        'data_hora',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'data_hora' => 'datetime',
    ];

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
}
