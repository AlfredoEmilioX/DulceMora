<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Promocion
 * Tabla: promociones
 * Uso: Gestiona promociones y descuentos comerciales.
 */
class Promocion extends Model
{
    protected $table = 'promociones';
    protected $primaryKey = 'id_promocion';

    protected $fillable = [
        'nombre_promocion',
        'descripcion',
        'tipo_descuento',
        'valor_descuento',
        'fecha_inicio',
        'fecha_fin',
        'monto_minimo',
        'estado',
    ];

    protected $casts = [
        'valor_descuento' => 'decimal:2',
        'monto_minimo' => 'decimal:2',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'estado' => 'boolean',
    ];

    public function productos()
    {
        return $this->belongsToMany(
            Producto::class,
            'promocion_productos',
            'id_promocion',
            'id_producto'
        )->withPivot('id_promocion_producto');
    }

    public function promocionProductos()
    {
        return $this->hasMany(PromocionProducto::class, 'id_promocion', 'id_promocion');
    }
}