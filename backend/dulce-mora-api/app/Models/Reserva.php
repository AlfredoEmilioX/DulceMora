<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Reserva
 * Tabla: reservas
 * Uso: Gestiona reservas de productos o pedidos programados.
 */
class Reserva extends Model
{
    protected $table = 'reservas';
    protected $primaryKey = 'id_reserva';

    protected $fillable = [
        'id_cliente',
        'id_sede',
        'fecha_reserva',
        'fecha_recojo',
        'subtotal',
        'adelanto',
        'total',
        'estado_reserva',
        'observacion',
    ];

    protected $casts = [
        'fecha_reserva' => 'datetime',
        'fecha_recojo' => 'datetime',
        'subtotal' => 'decimal:2',
        'adelanto' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'id_sede', 'id_sede');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleReserva::class, 'id_reserva', 'id_reserva');
    }
}