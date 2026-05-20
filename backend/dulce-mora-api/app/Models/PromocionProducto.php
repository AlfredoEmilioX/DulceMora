<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: PromocionProducto
 * Tabla: promocion_productos
 * Uso: Relaciona promociones con productos.
 */
class PromocionProducto extends Model
{
    protected $table = 'promocion_productos';
    protected $primaryKey = 'id_promocion_producto';

    protected $fillable = [
        'id_promocion',
        'id_producto',
    ];

    public function promocion()
    {
        return $this->belongsTo(Promocion::class, 'id_promocion', 'id_promocion');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }
}