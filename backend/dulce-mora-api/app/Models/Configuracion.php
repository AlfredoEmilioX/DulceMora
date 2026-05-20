<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Configuracion
 * Tabla: configuraciones
 * Uso: Gestiona datos generales del negocio y parámetros visuales.
 */
class Configuracion extends Model
{
    protected $table = 'configuraciones';
    protected $primaryKey = 'id_configuracion';

    protected $fillable = [
        'nombre_negocio',
        'logo',
        'color_primario',
        'color_secundario',
        'telefono',
        'whatsapp',
        'email',
        'direccion',
        'facebook',
        'instagram',
        'tiktok',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}