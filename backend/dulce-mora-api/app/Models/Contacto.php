<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Contacto
 * Tabla: contactos
 * Uso: Gestiona mensajes enviados desde la web pública.
 */
class Contacto extends Model
{
    protected $table = 'contactos';
    protected $primaryKey = 'id_contacto';

    protected $fillable = [
        'nombres',
        'email',
        'telefono',
        'asunto',
        'mensaje',
        'estado_contacto',
    ];
}