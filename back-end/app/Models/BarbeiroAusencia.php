<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarbeiroAusencia extends Model
{
    protected $fillable = ['barbeiro_id', 'inicio_em', 'fim_em', 'motivo'];

    protected $casts = [
        'inicio_em' => 'datetime',
        'fim_em' => 'datetime',
    ];

    public function barbeiro(): BelongsTo
    {
        return $this->belongsTo(Barbeiro::class);
    }
}
