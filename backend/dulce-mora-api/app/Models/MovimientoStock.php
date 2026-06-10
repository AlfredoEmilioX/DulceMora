<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: MovimientoStock
 * Tabla: movimientos_stock
 * Uso: Registra entradas, salidas y ajustes de inventario.
 */
class MovimientoStock extends Model
{
    protected $table = 'movimientos_stock';
    protected $primaryKey = 'id_movimiento_stock';

    protected $fillable = [
        'id_stock',
        'id_usuario',
        'tipo_movimiento',
        'cantidad',
        'stock_anterior',
        'stock_actual',
        'motivo',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'stock_anterior' => 'integer',
        'stock_actual' => 'integer',
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class, 'id_stock', 'id_stock');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}