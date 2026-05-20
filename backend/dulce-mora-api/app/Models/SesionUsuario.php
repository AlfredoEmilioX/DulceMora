<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: SesionUsuario
 * Tabla: sesiones_usuario
 * Uso: Gestiona sesiones e inicios de sesión.
 */
class SesionUsuario extends Model
{
    protected $table = 'sesiones_usuario';
    protected $primaryKey = 'id_sesion';

    protected $fillable = [
        'id_usuario',
        'token',
        'ip',
        'user_agent',
        'fecha_inicio',
        'fecha_fin',
        'activo',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'activo' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}