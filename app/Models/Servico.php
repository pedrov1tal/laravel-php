<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Servico extends Model
{
    protected $fillable = [
        'nome',
        'descricao',
        'duracao_minutos',
        'preco',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
    ];

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class);
    }
}
