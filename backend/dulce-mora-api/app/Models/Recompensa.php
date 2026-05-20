<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Recompensa
 * Tabla: recompensas
 * Uso: Gestiona puntos y beneficios de clientes.
 */
class Recompensa extends Model
{
    protected $table = 'recompensas';
    protected $primaryKey = 'id_recompensa';

    protected $fillable = [
        'id_cliente',
        'puntos',
        'nivel',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}