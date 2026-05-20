<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Opinion
 * Tabla: opiniones
 * Uso: Gestiona valoraciones y comentarios de clientes.
 */
class Opinion extends Model
{
    protected $table = 'opiniones';
    protected $primaryKey = 'id_opinion';

    protected $fillable = [
        'id_cliente',
        'id_producto',
        'calificacion',
        'comentario',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }
}