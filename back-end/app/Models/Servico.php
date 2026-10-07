<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Servico extends Model
{
    protected $fillable = [
        'barbearia_id',
        'nome',
        'descricao',
        'duracao_minutos',
        'preco',
        'ativo',
    ];

    protected $casts = [
        'duracao_minutos' => 'integer',
        'preco' => 'decimal:2',
        'ativo' => 'boolean',
    ];

    public function barbearia(): BelongsTo
    {
        return $this->belongsTo(Barbearia::class);
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class);
    }

    public function barbeiros(): BelongsToMany
    {
        return $this->belongsToMany(Barbeiro::class, 'barbeiro_servico')
            ->withTimestamps();
    }

    public function scopeAtivos(Builder $query): void
    {
        $query->where('ativo', true);
    }

    public function desativar(): bool
    {
        return $this->forceFill(['ativo' => false])->save();
    }
}
