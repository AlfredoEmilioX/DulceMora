<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Notificacion
 * Tabla: notificaciones
 */
class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $primaryKey = 'id_notificacion';

    protected $fillable = [
        'id_usuario',
        'titulo',
        'mensaje',
        'tipo',
        'leido',
    ];

    protected $casts = [
        'leido' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}