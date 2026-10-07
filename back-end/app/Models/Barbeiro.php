<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barbeiro extends Model
{
    protected $fillable = [
        'barbearia_id',
        'user_id',
        'nome',
        'telefone',
        'email',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function barbearia(): BelongsTo
    {
        return $this->belongsTo(Barbearia::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class);
    }

    public function servicos(): BelongsToMany
    {
        return $this->belongsToMany(Servico::class, 'barbeiro_servico')
            ->withTimestamps();
    }

    public function horariosTrabalho(): HasMany
    {
        return $this->hasMany(BarbeiroHorario::class);
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
