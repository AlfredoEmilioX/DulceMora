<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Delivery
 * Tabla: delivery
 * Uso: Gestiona información de entrega de pedidos.
 */
class Delivery extends Model
{
    protected $table = 'delivery';
    protected $primaryKey = 'id_delivery';

    protected $fillable = [
        'id_pedido',
        'id_usuario',
        'direccion_entrega',
        'referencia',
        'costo_delivery',
        'fecha_salida',
        'fecha_entrega',
        'estado_delivery',
        'observacion',
    ];

    protected $casts = [
        'costo_delivery' => 'decimal:2',
        'fecha_salida' => 'datetime',
        'fecha_entrega' => 'datetime',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'id_pedido', 'id_pedido');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}