<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Cupon
 * Tabla: cupones
 * Uso: Gestiona códigos de descuento.
 */
class Cupon extends Model
{
    protected $table = 'cupones';
    protected $primaryKey = 'id_cupon';

    protected $fillable = [
        'codigo',
        'descripcion',
        'tipo_descuento',
        'valor_descuento',
        'monto_minimo',
        'limite_uso',
        'usos_actuales',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    protected $casts = [
        'valor_descuento' => 'decimal:2',
        'monto_minimo' => 'decimal:2',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'estado' => 'boolean',
    ];

    public function clientes()
    {
        return $this->belongsToMany(
            Cliente::class,
            'cupon_cliente',
            'id_cupon',
            'id_cliente'
        );
    }
}