<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Stock
 * Tabla: stock
 * Uso: Gestiona existencias de productos por sede.
 */
class Stock extends Model
{
    protected $table = 'stock';
    protected $primaryKey = 'id_stock';

    protected $fillable = [
        'id_producto',
        'id_sede',
        'cantidad',
        'stock_minimo',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'id_sede', 'id_sede');
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoStock::class, 'id_stock', 'id_stock');
    }
}