<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Rol;
use App\Models\Sede;
use App\Models\Usuario;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Stock;
use App\Models\Configuracion;

class DatosInicialesSeeder extends Seeder
{
    /**
     * Seeder: DatosInicialesSeeder
     * Uso: Carga datos base para iniciar el sistema Dulce Mora.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Roles
        |--------------------------------------------------------------------------
        */
        $administrador = Rol::updateOrCreate(
            ['nombre_rol' => 'Administrador'],
            [
                'descripcion' => 'Acceso total al sistema',
                'estado' => true,
            ]
        );

        $vendedor = Rol::updateOrCreate(
            ['nombre_rol' => 'Vendedor'],
            [
                'descripcion' => 'Acceso a ventas, pedidos y consulta de stock',
                'estado' => true,
            ]
        );

        $clienteRol = Rol::updateOrCreate(
            ['nombre_rol' => 'Cliente'],
            [
                'descripcion' => 'Acceso a funciones de cliente web',
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Sede principal
        |--------------------------------------------------------------------------
        */
        $sede = Sede::updateOrCreate(
            ['nombre_comercial' => 'Dulce Mora Principal'],
            [
                'direccion' => 'Huancayo',
                'telefono' => '999999999',
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Usuarios internos
        |--------------------------------------------------------------------------
        */
        Usuario::updateOrCreate(
            ['email' => 'admin@dulcemora.com'],
            [
                'id_rol' => $administrador->id_rol,
                'id_sede' => $sede->id_sede,
                'nombres' => 'Admin',
                'apellidos' => 'Dulce Mora',
                'password' => Hash::make('12345678'),
                'telefono' => '999999999',
                'estado' => true,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'vendedor@dulcemora.com'],
            [
                'id_rol' => $vendedor->id_rol,
                'id_sede' => $sede->id_sede,
                'nombres' => 'Vendedor',
                'apellidos' => 'Prueba',
                'password' => Hash::make('12345678'),
                'telefono' => '988888888',
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Categorías
        |--------------------------------------------------------------------------
        */
        $categoriaTortas = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Tortas'],
            [
                'descripcion' => 'Productos de pastelería',
                'estado' => true,
            ]
        );

        $categoriaPostres = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Postres'],
            [
                'descripcion' => 'Postres dulces para venta',
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Productos
        |--------------------------------------------------------------------------
        */
        $productoTorta = Producto::updateOrCreate(
            ['nombre_producto' => 'Torta de chocolate'],
            [
                'id_categoria' => $categoriaTortas->id_categoria,
                'descripcion' => 'Torta clásica de chocolate',
                'precio' => 45.00,
                'imagen' => null,
                'estado' => true,
            ]
        );

        $productoTresLeches = Producto::updateOrCreate(
            ['nombre_producto' => 'Tres leches personal'],
            [
                'id_categoria' => $categoriaPostres->id_categoria,
                'descripcion' => 'Postre tres leches en presentación personal',
                'precio' => 12.00,
                'imagen' => null,
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Stock inicial
        |--------------------------------------------------------------------------
        */
        Stock::updateOrCreate(
            [
                'id_producto' => $productoTorta->id_producto,
                'id_sede' => $sede->id_sede,
            ],
            [
                'cantidad' => 30,
                'stock_minimo' => 5,
                'estado' => true,
            ]
        );

        Stock::updateOrCreate(
            [
                'id_producto' => $productoTresLeches->id_producto,
                'id_sede' => $sede->id_sede,
            ],
            [
                'cantidad' => 50,
                'stock_minimo' => 10,
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Configuración del negocio
        |--------------------------------------------------------------------------
        */
        Configuracion::updateOrCreate(
            ['nombre_negocio' => 'Dulce Mora'],
            [
                'logo' => null,
                'color_primario' => '#D96C94',
                'color_secundario' => '#F7C6D9',
                'telefono' => '999999999',
                'whatsapp' => '999999999',
                'email' => 'contacto@dulcemora.com',
                'direccion' => 'Huancayo',
                'facebook' => null,
                'instagram' => null,
                'tiktok' => null,
                'estado' => true,
            ]
        );
    }
}