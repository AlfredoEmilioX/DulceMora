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
     * Carga datos iniciales del sistema Dulce Mora.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. ROLES
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
        | 2. SEDES
        |--------------------------------------------------------------------------
        */

        $sedeHuancayoPrincipal = Sede::updateOrCreate(
            ['nombre_comercial' => 'Dulce Mora Huancayo Principal'],
            [
                'direccion' => 'Jr. Nacional 608, Huancayo',
                'telefono' => '999999999',
                'estado' => true,
            ]
        );

        $sedeHuancayoSanCarlos = Sede::updateOrCreate(
            ['nombre_comercial' => 'Dulce Mora Huancayo San Carlos'],
            [
                'direccion' => 'San Carlos, Huancayo',
                'telefono' => '988888888',
                'estado' => true,
            ]
        );

        $sedeConcepcionCentro = Sede::updateOrCreate(
            ['nombre_comercial' => 'Dulce Mora Concepción Centro'],
            [
                'direccion' => 'Centro de Concepción',
                'telefono' => '977777777',
                'estado' => true,
            ]
        );

        $sedeConcepcionSegundoLocal = Sede::updateOrCreate(
            ['nombre_comercial' => 'Dulce Mora Concepción Segundo Local'],
            [
                'direccion' => 'Segundo local, Concepción',
                'telefono' => '966666666',
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | 3. USUARIOS
        |--------------------------------------------------------------------------
        */

        Usuario::updateOrCreate(
            ['email' => 'admin@dulcemora.com'],
            [
                'id_rol' => $administrador->id_rol,
                'id_sede' => $sedeHuancayoPrincipal->id_sede,
                'nombres' => 'Admin',
                'apellidos' => 'Dulce Mora',
                'password' => Hash::make('12345678'),
                'telefono' => '999999999',
                'estado' => true,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'vendedor.huancayo@dulcemora.com'],
            [
                'id_rol' => $vendedor->id_rol,
                'id_sede' => $sedeHuancayoPrincipal->id_sede,
                'nombres' => 'Vendedor',
                'apellidos' => 'Huancayo Principal',
                'password' => Hash::make('12345678'),
                'telefono' => '988111111',
                'estado' => true,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'vendedor.sancarlos@dulcemora.com'],
            [
                'id_rol' => $vendedor->id_rol,
                'id_sede' => $sedeHuancayoSanCarlos->id_sede,
                'nombres' => 'Vendedor',
                'apellidos' => 'San Carlos',
                'password' => Hash::make('12345678'),
                'telefono' => '988222222',
                'estado' => true,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'vendedor.concepcion1@dulcemora.com'],
            [
                'id_rol' => $vendedor->id_rol,
                'id_sede' => $sedeConcepcionCentro->id_sede,
                'nombres' => 'Vendedor',
                'apellidos' => 'Concepción Centro',
                'password' => Hash::make('12345678'),
                'telefono' => '988333333',
                'estado' => true,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'vendedor.concepcion2@dulcemora.com'],
            [
                'id_rol' => $vendedor->id_rol,
                'id_sede' => $sedeConcepcionSegundoLocal->id_sede,
                'nombres' => 'Vendedor',
                'apellidos' => 'Concepción Segundo Local',
                'password' => Hash::make('12345678'),
                'telefono' => '988444444',
                'estado' => true,
            ]
        );

        Usuario::updateOrCreate(
            ['email' => 'cliente@dulcemora.com'],
            [
                'id_rol' => $clienteRol->id_rol,
                'id_sede' => $sedeHuancayoPrincipal->id_sede,
                'nombres' => 'Cliente',
                'apellidos' => 'Prueba',
                'password' => Hash::make('12345678'),
                'telefono' => '988555555',
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | 4. CATEGORÍAS
        |--------------------------------------------------------------------------
        */

        $categoriaTortas = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Tortas'],
            [
                'descripcion' => 'Tortas artesanales para celebraciones y pedidos especiales',
                'estado' => true,
            ]
        );

        $categoriaHelados = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Helados'],
            [
                'descripcion' => 'Helados artesanales en vaso y sabores especiales',
                'estado' => true,
            ]
        );

        $categoriaPostres = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Postres'],
            [
                'descripcion' => 'Postres dulces en presentaciones personales',
                'estado' => true,
            ]
        );

        $categoriaAlfajores = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Alfajores'],
            [
                'descripcion' => 'Alfajores rellenos de diferentes sabores',
                'estado' => true,
            ]
        );

        $categoriaCupcakes = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Cupcakes'],
            [
                'descripcion' => 'Cupcakes decorados para eventos y ocasiones especiales',
                'estado' => true,
            ]
        );

        $categoriaDonuts = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Donuts'],
            [
                'descripcion' => 'Donuts glaseadas y decoradas',
                'estado' => true,
            ]
        );

        $categoriaBebidas = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Bebidas'],
            [
                'descripcion' => 'Bebidas frutales, refrescos y acompañamientos',
                'estado' => true,
            ]
        );

        $categoriaPromociones = Categoria::updateOrCreate(
            ['nombre_categoria' => 'Promociones'],
            [
                'descripcion' => 'Productos y combos promocionales',
                'estado' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | 5. PRODUCTOS
        |--------------------------------------------------------------------------
        */

        $productos = [
            [
                'nombre_producto' => 'Torta de Chocolate',
                'categoria' => $categoriaTortas,
                'descripcion' => 'Torta artesanal de chocolate con crema y decoración especial',
                'precio' => 110.00,
            ],
            [
                'nombre_producto' => 'Torta Tres Leches',
                'categoria' => $categoriaTortas,
                'descripcion' => 'Torta húmeda tres leches con crema y cereza',
                'precio' => 120.00,
            ],
            [
                'nombre_producto' => 'Torta Beso de Ángel',
                'categoria' => $categoriaTortas,
                'descripcion' => 'Torta especial con crema, chocolate y decoración artesanal',
                'precio' => 130.00,
            ],
            [
                'nombre_producto' => 'Torta Personalizada',
                'categoria' => $categoriaTortas,
                'descripcion' => 'Torta personalizada para cumpleaños y eventos especiales',
                'precio' => 150.00,
            ],
            [
                'nombre_producto' => 'Helado Artesanal',
                'categoria' => $categoriaHelados,
                'descripcion' => 'Helado artesanal en vaso con sabores variados',
                'precio' => 9.00,
            ],
            [
                'nombre_producto' => 'Helado Popcorn',
                'categoria' => $categoriaHelados,
                'descripcion' => 'Helado sabor popcorn en presentación personal',
                'precio' => 10.00,
            ],
            [
                'nombre_producto' => 'Helado de Dos Sabores',
                'categoria' => $categoriaHelados,
                'descripcion' => 'Helado artesanal combinado con dos sabores',
                'precio' => 12.00,
            ],
            [
                'nombre_producto' => 'Milhojas',
                'categoria' => $categoriaPostres,
                'descripcion' => 'Postre milhojas con relleno dulce y azúcar impalpable',
                'precio' => 8.50,
            ],
            [
                'nombre_producto' => 'Muffin de Chocolate',
                'categoria' => $categoriaPostres,
                'descripcion' => 'Muffin de chocolate con relleno cremoso',
                'precio' => 7.00,
            ],
            [
                'nombre_producto' => 'Cupcake de Cereza',
                'categoria' => $categoriaCupcakes,
                'descripcion' => 'Cupcake decorado con crema rosa, chispas y cereza',
                'precio' => 6.50,
            ],
            [
                'nombre_producto' => 'Donut Glaseada Amarilla',
                'categoria' => $categoriaDonuts,
                'descripcion' => 'Donut glaseada amarilla con chispas de colores',
                'precio' => 5.00,
            ],
            [
                'nombre_producto' => 'Donut Glaseada Rosada',
                'categoria' => $categoriaDonuts,
                'descripcion' => 'Donut glaseada rosada con chispas de colores',
                'precio' => 5.00,
            ],
            [
                'nombre_producto' => 'Alfajor de Mango',
                'categoria' => $categoriaAlfajores,
                'descripcion' => 'Alfajor relleno con crema de mango',
                'precio' => 6.00,
            ],
            [
                'nombre_producto' => 'Alfajor de Maracuyá',
                'categoria' => $categoriaAlfajores,
                'descripcion' => 'Alfajor relleno con crema de maracuyá',
                'precio' => 6.00,
            ],
            [
                'nombre_producto' => 'Cheesecake de Maracuyá',
                'categoria' => $categoriaPostres,
                'descripcion' => 'Cheesecake personal de maracuyá en presentación individual',
                'precio' => 11.00,
            ],
        ];

        $productosCreados = [];

        foreach ($productos as $item) {
            $producto = Producto::updateOrCreate(
                ['nombre_producto' => $item['nombre_producto']],
                [
                    'id_categoria' => $item['categoria']->id_categoria,
                    'descripcion' => $item['descripcion'],
                    'precio' => $item['precio'],
                    'imagen' => null,
                    'estado' => true,
                ]
            );

            $productosCreados[] = $producto;
        }

        /*
        |--------------------------------------------------------------------------
        | 6. STOCK POR SEDE
        |--------------------------------------------------------------------------
        */

        $sedes = [
            $sedeHuancayoPrincipal,
            $sedeHuancayoSanCarlos,
            $sedeConcepcionCentro,
            $sedeConcepcionSegundoLocal,
        ];

        foreach ($productosCreados as $index => $producto) {
            foreach ($sedes as $sedeIndex => $sede) {
                Stock::updateOrCreate(
                    [
                        'id_producto' => $producto->id_producto,
                        'id_sede' => $sede->id_sede,
                    ],
                    [
                        'cantidad' => 20 + ($index * 2) + ($sedeIndex * 3),
                        'stock_minimo' => 5,
                        'estado' => true,
                    ]
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 7. CONFIGURACIÓN DEL NEGOCIO
        |--------------------------------------------------------------------------
        */

        Configuracion::updateOrCreate(
            ['nombre_negocio' => 'Dulce Mora'],
            [
                'logo' => 'logo-dulce-mora.png',
                'color_primario' => '#DF73A3',
                'color_secundario' => '#F8DDEA',
                'telefono' => '999999999',
                'whatsapp' => '999999999',
                'email' => 'contacto@dulcemora.com',
                'direccion' => 'Huancayo, Perú',
                'facebook' => 'https://www.facebook.com/dulcemora.pasteleriayheladeria',
                'instagram' => null,
                'tiktok' => null,
                'estado' => true,
            ]
        );
    }
}