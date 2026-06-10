<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Caja
 * Tabla: cajas
 * Uso: Gestiona apertura, cierre y control de caja por sede.
 */
class Caja extends Model
{
    protected $table = 'cajas';
    protected $primaryKey = 'id_caja';

    protected $fillable = [
        'id_sede',
        'id_usuario',
        'fecha_apertura',
        'fecha_cierre',
        'monto_inicial',
        'monto_final',
        'total_ventas',
        'estado_caja',
        'observacion',
    ];

    protected $casts = [
        'fecha_apertura' => 'datetime',
        'fecha_cierre' => 'datetime',
        'monto_inicial' => 'decimal:2',
        'monto_final' => 'decimal:2',
        'total_ventas' => 'decimal:2',
    ];

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'id_sede', 'id_sede');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}