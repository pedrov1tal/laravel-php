<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barbearia extends Model
{
    protected $fillable = [
        'slug',
        'nome',
        'descricao',
        'logo_path',
        'telefone',
        'email',
        'endereco',
        'cor_primaria',
        'cor_destaque',
        'fuso_horario',
        'antecedencia_cancelamento_minutos',
        'ativa',
    ];

    protected $casts = [
        'antecedencia_cancelamento_minutos' => 'integer',
        'ativa' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function administradores(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'barbearia_administradores')
            ->withTimestamps();
    }

    public function barbeiros(): HasMany
    {
        return $this->hasMany(Barbeiro::class);
    }

    public function servicos(): HasMany
    {
        return $this->hasMany(Servico::class);
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class);
    }

    public function horariosFuncionamento(): HasMany
    {
        return $this->hasMany(BarbeariaHorario::class);
    }

    public function scopeAtivas(Builder $query): void
    {
        $query->where('ativa', true);
    }
}
