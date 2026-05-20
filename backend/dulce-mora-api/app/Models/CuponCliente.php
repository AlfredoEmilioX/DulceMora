<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: CuponCliente
 * Tabla: cupon_cliente
 * Uso: Gestiona cupones asignados o usados por clientes.
 */
class CuponCliente extends Model
{
    protected $table = 'cupon_cliente';
    protected $primaryKey = 'id_cupon_cliente';

    protected $fillable = [
        'id_cupon',
        'id_cliente',
        'fecha_asignacion',
        'fecha_uso',
        'usado',
    ];

    protected $casts = [
        'fecha_asignacion' => 'datetime',
        'fecha_uso' => 'datetime',
        'usado' => 'boolean',
    ];

    public function cupon()
    {
        return $this->belongsTo(Cupon::class, 'id_cupon', 'id_cupon');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}