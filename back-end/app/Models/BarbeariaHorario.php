<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarbeariaHorario extends Model
{
    protected $table = 'barbearia_horarios';

    protected $fillable = [
        'barbearia_id',
        'dia_semana',
        'abre_as',
        'fecha_as',
        'fechado',
    ];

    protected $casts = [
        'dia_semana' => 'integer',
        'fechado' => 'boolean',
    ];

    public function barbearia(): BelongsTo
    {
        return $this->belongsTo(Barbearia::class);
    }
}
