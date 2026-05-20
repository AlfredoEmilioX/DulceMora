<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: RecuperacionContrasena
 * Tabla: recuperacion_contrasenas
 * Uso: Gestiona tokens para restablecer contraseñas.
 */
class RecuperacionContrasena extends Model
{
    protected $table = 'recuperacion_contrasenas';
    protected $primaryKey = 'id_recuperacion';

    protected $fillable = [
        'id_usuario',
        'email',
        'token',
        'fecha_expiracion',
        'usado',
    ];

    protected $casts = [
        'fecha_expiracion' => 'datetime',
        'usado' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}