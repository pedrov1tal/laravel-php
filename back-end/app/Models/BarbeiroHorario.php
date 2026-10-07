<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarbeiroHorario extends Model
{
    protected $table = 'barbeiro_horarios';

    protected $fillable = [
        'barbeiro_id',
        'dia_semana',
        'inicia_as',
        'termina_as',
        'indisponivel',
    ];

    protected $casts = [
        'dia_semana' => 'integer',
        'indisponivel' => 'boolean',
    ];

    public function barbeiro(): BelongsTo
    {
        return $this->belongsTo(Barbeiro::class);
    }
}
