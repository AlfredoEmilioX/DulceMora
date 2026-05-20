<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: DetalleReserva
 * Tabla: detalle_reservas
 * Uso: Gestiona productos incluidos en cada reserva.
 */
class DetalleReserva extends Model
{
    protected $table = 'detalle_reservas';
    protected $primaryKey = 'id_detalle_reserva';

    protected $fillable = [
        'id_reserva',
        'id_producto',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ];

    protected $casts = [
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva', 'id_reserva');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }
}