<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo: Cliente
 * Tabla: clientes
 * Uso: Gestiona clientes, pedidos, ventas y beneficios.
 */
class Cliente extends Model
{
    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';

    protected $fillable = [
    'dni',
    'nombres',
    'apellidos',
    'telefono',
    'email',
    'fecha_nacimiento',
    'direccion',
    'acepta_promociones',
    'fecha_ultimo_saludo_cumpleanos',
    'estado',
    ];

    protected $casts = [
    'fecha_nacimiento' => 'date',
    'fecha_ultimo_saludo_cumpleanos' => 'date',
    'acepta_promociones' => 'boolean',
    'estado' => 'boolean',
];
    public function ventas()
    {
        return $this->hasMany(Venta::class, 'id_cliente', 'id_cliente');
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'id_cliente', 'id_cliente');
    }

    public function recompensas()
    {
        return $this->hasMany(Recompensa::class, 'id_cliente', 'id_cliente');
    }

    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'id_cliente', 'id_cliente');
    }
}