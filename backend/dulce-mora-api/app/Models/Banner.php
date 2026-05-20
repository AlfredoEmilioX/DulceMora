<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Banner
 * Tabla: banners
 * Uso: Gestiona imágenes promocionales de la web pública.
 */
class Banner extends Model
{
    protected $table = 'banners';
    protected $primaryKey = 'id_banner';

    protected $fillable = [
        'titulo',
        'subtitulo',
        'imagen',
        'enlace',
        'orden',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];
}