<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Comprobante
 * Tabla: comprobantes
 * Uso: Gestiona boletas, facturas o tickets de venta.
 */
class Comprobante extends Model
{
    protected $table = 'comprobantes';
    protected $primaryKey = 'id_comprobante';

    protected $fillable = [
        'id_venta',
        'tipo_comprobante',
        'serie',
        'numero',
        'fecha_emision',
        'subtotal',
        'igv',
        'total',
        'estado_comprobante',
    ];

    protected $casts = [
        'fecha_emision' => 'datetime',
        'subtotal' => 'decimal:2',
        'igv' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'id_venta', 'id_venta');
    }
}