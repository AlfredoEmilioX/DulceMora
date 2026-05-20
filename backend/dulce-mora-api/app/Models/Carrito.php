<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Carrito
 * Tabla: carrito
 * Uso: Gestiona productos agregados al carrito.
 */
class Carrito extends Model
{
    protected $table = 'carrito';
    protected $primaryKey = 'id_carrito';

    protected $fillable = [
        'id_cliente',
        'id_producto',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ];

    protected $casts = [
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }
}