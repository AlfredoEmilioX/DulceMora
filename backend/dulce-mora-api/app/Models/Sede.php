<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Sede
 * Tabla: sedes
 * Uso: Gestiona los locales o puntos de venta.
 */
class Sede extends Model
{
    protected $table = 'sedes';
    protected $primaryKey = 'id_sede';

    protected $fillable = [
        'nombre_comercial',
        'direccion',
        'telefono',
        'estado',
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'id_sede', 'id_sede');
    }

    public function productosStock()
    {
        return $this->hasMany(Stock::class, 'id_sede', 'id_sede');
    }
}