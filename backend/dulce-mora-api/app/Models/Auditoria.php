<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Auditoria
 * Tabla: auditorias
 * Uso: Registra acciones realizadas por usuarios.
 */
class Auditoria extends Model
{
    protected $table = 'auditorias';
    protected $primaryKey = 'id_auditoria';

    protected $fillable = [
        'id_usuario',
        'tabla_afectada',
        'id_registro',
        'accion',
        'descripcion',
        'ip',
        'user_agent',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}