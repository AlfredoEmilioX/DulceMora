<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: HistorialEstadoPedido
 * Tabla: historial_estados_pedido
 * Uso: Registra cambios de estado de pedidos.
 */
class HistorialEstadoPedido extends Model
{
    protected $table = 'historial_estados_pedido';
    protected $primaryKey = 'id_historial_estado_pedido';

    protected $fillable = [
        'id_pedido',
        'id_usuario',
        'estado_anterior',
        'estado_nuevo',
        'observacion',
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