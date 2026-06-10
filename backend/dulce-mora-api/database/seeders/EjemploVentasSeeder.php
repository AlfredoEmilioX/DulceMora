<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cliente;
use App\Models\Sede;
use App\Models\Usuario;
use App\Models\Producto;
use App\Models\Stock;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Pago;
use App\Models\MovimientoStock;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EjemploVentasSeeder extends Seeder
{
    /**
     * Carga clientes, ventas, detalles, pagos y movimientos de stock de ejemplo.
     */
    public function run(): void
    {
        DB::transaction(function () {

            /*
            |--------------------------------------------------------------------------
            | Limpiar datos de ventas de ejemplo
            |--------------------------------------------------------------------------
            */

            Pago::whereNotNull('id_venta')->delete();
            DetalleVenta::query()->delete();
            MovimientoStock::where('motivo', 'Venta de ejemplo')->delete();
            Venta::query()->delete();

            /*
            |--------------------------------------------------------------------------
            | Obtener sedes
            |--------------------------------------------------------------------------
            */

            $sedeHuancayoPrincipal = Sede::where('nombre_comercial', 'Dulce Mora Huancayo Principal')->first();
            $sedeHuancayoSanCarlos = Sede::where('nombre_comercial', 'Dulce Mora Huancayo San Carlos')->first();
            $sedeConcepcionCentro = Sede::where('nombre_comercial', 'Dulce Mora Concepción Centro')->first();
            $sedeConcepcionSegundo = Sede::where('nombre_comercial', 'Dulce Mora Concepción Segundo Local')->first();

            /*
            |--------------------------------------------------------------------------
            | Obtener vendedores
            |--------------------------------------------------------------------------
            */

            $vendedorHuancayo = Usuario::where('email', 'vendedor.huancayo@dulcemora.com')->first();
            $vendedorSanCarlos = Usuario::where('email', 'vendedor.sancarlos@dulcemora.com')->first();
            $vendedorConcepcion1 = Usuario::where('email', 'vendedor.concepcion1@dulcemora.com')->first();
            $vendedorConcepcion2 = Usuario::where('email', 'vendedor.concepcion2@dulcemora.com')->first();

            /*
            |--------------------------------------------------------------------------
            | Clientes de ejemplo
            |--------------------------------------------------------------------------
            */

            $clientesData = [
                [
                    'dni' => '71234567',
                    'nombres' => 'Ana',
                    'apellidos' => 'Torres Huamán',
                    'telefono' => '987654321',
                    'email' => 'ana.torres@example.com',
                    'fecha_nacimiento' => '1998-05-21',
                    'direccion' => 'Huancayo',
                ],
                [
                    'dni' => '71234568',
                    'nombres' => 'Carlos',
                    'apellidos' => 'Mendoza Pacheco',
                    'telefono' => '987654322',
                    'email' => 'carlos.mendoza@example.com',
                    'fecha_nacimiento' => '1992-08-10',
                    'direccion' => 'San Carlos, Huancayo',
                ],
                [
                    'dni' => '71234569',
                    'nombres' => 'Lucía',
                    'apellidos' => 'Ramos Salazar',
                    'telefono' => '987654323',
                    'email' => 'lucia.ramos@example.com',
                    'fecha_nacimiento' => '1995-03-15',
                    'direccion' => 'Concepción',
                ],
                [
                    'dni' => '71234570',
                    'nombres' => 'Miguel',
                    'apellidos' => 'Quispe Vargas',
                    'telefono' => '987654324',
                    'email' => 'miguel.quispe@example.com',
                    'fecha_nacimiento' => '1990-12-30',
                    'direccion' => 'Concepción',
                ],
                [
                    'dni' => '71234571',
                    'nombres' => 'Valeria',
                    'apellidos' => 'Huamán Flores',
                    'telefono' => '987654325',
                    'email' => 'valeria.huaman@example.com',
                    'fecha_nacimiento' => '1997-11-12',
                    'direccion' => 'Huancayo',
                ],
                [
                    'dni' => '71234572',
                    'nombres' => 'Daniela',
                    'apellidos' => 'Rojas Gutiérrez',
                    'telefono' => '987654326',
                    'email' => 'daniela.rojas@example.com',
                    'fecha_nacimiento' => '2000-01-25',
                    'direccion' => 'San Carlos, Huancayo',
                ],
                [
                    'dni' => '71234573',
                    'nombres' => 'José',
                    'apellidos' => 'Paredes Córdova',
                    'telefono' => '987654327',
                    'email' => 'jose.paredes@example.com',
                    'fecha_nacimiento' => '1996-09-14',
                    'direccion' => 'Concepción',
                ],
                [
                    'dni' => '71234574',
                    'nombres' => 'Camila',
                    'apellidos' => 'Flores Pinto',
                    'telefono' => '987654328',
                    'email' => 'camila.flores@example.com',
                    'fecha_nacimiento' => '1999-07-19',
                    'direccion' => 'Concepción',
                ],
                [
                    'dni' => '71234575',
                    'nombres' => 'Fernanda',
                    'apellidos' => 'Soto Ríos',
                    'telefono' => '987654329',
                    'email' => 'fernanda.soto@example.com',
                    'fecha_nacimiento' => '1993-04-02',
                    'direccion' => 'Huancayo',
                ],
                [
                    'dni' => '71234576',
                    'nombres' => 'Luis',
                    'apellidos' => 'Castillo Poma',
                    'telefono' => '987654330',
                    'email' => 'luis.castillo@example.com',
                    'fecha_nacimiento' => '1991-06-22',
                    'direccion' => 'San Carlos, Huancayo',
                ],
                [
                    'dni' => '71234577',
                    'nombres' => 'María',
                    'apellidos' => 'Palomino Rojas',
                    'telefono' => '987654331',
                    'email' => 'maria.palomino@example.com',
                    'fecha_nacimiento' => '1994-10-05',
                    'direccion' => 'Huancayo',
                ],
                [
                    'dni' => '71234578',
                    'nombres' => 'Renato',
                    'apellidos' => 'Vargas León',
                    'telefono' => '987654332',
                    'email' => 'renato.vargas@example.com',
                    'fecha_nacimiento' => '1989-02-18',
                    'direccion' => 'Concepción',
                ],
                [
                    'dni' => '71234579',
                    'nombres' => 'Andrea',
                    'apellidos' => 'Meza Campos',
                    'telefono' => '987654333',
                    'email' => 'andrea.meza@example.com',
                    'fecha_nacimiento' => '1998-05-23',
                    'direccion' => 'Huancayo',
                ],
                [
                    'dni' => '71234580',
                    'nombres' => 'Sebastián',
                    'apellidos' => 'Ríos Espinoza',
                    'telefono' => '987654334',
                    'email' => 'sebastian.rios@example.com',
                    'fecha_nacimiento' => '1995-12-01',
                    'direccion' => 'San Carlos, Huancayo',
                ],
                [
                    'dni' => '71234581',
                    'nombres' => 'Patricia',
                    'apellidos' => 'Salazar Vega',
                    'telefono' => '987654335',
                    'email' => 'patricia.salazar@example.com',
                    'fecha_nacimiento' => '1990-05-28',
                    'direccion' => 'Concepción',
                ],
            ];

            $clientes = [];

            foreach ($clientesData as $data) {
                $clientes[] = Cliente::updateOrCreate(
                    ['dni' => $data['dni']],
                    [
                        'nombres' => $data['nombres'],
                        'apellidos' => $data['apellidos'],
                        'telefono' => $data['telefono'],
                        'email' => $data['email'],
                        'fecha_nacimiento' => $data['fecha_nacimiento'],
                        'direccion' => $data['direccion'],
                        'acepta_promociones' => true,
                        'fecha_ultimo_saludo_cumpleanos' => null,
                        'estado' => true,
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Productos
            |--------------------------------------------------------------------------
            */

            $productos = Producto::all();

            /*
            |--------------------------------------------------------------------------
            | Ventas de ejemplo
            |--------------------------------------------------------------------------
            */

            $ventasData = [
                [
                    'cliente' => 0,
                    'sede' => $sedeHuancayoPrincipal,
                    'usuario' => $vendedorHuancayo,
                    'fecha' => now()->subDays(14),
                    'metodo_pago' => 'efectivo',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Torta de Chocolate', 'cantidad' => 1],
                        ['producto' => 'Helado Artesanal', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 1,
                    'sede' => $sedeHuancayoSanCarlos,
                    'usuario' => $vendedorSanCarlos,
                    'fecha' => now()->subDays(13),
                    'metodo_pago' => 'yape',
                    'descuento' => 5,
                    'items' => [
                        ['producto' => 'Alfajor de Mango', 'cantidad' => 3],
                        ['producto' => 'Cupcake de Cereza', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 2,
                    'sede' => $sedeConcepcionCentro,
                    'usuario' => $vendedorConcepcion1,
                    'fecha' => now()->subDays(12),
                    'metodo_pago' => 'plin',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Torta Tres Leches', 'cantidad' => 1],
                    ],
                ],
                [
                    'cliente' => 3,
                    'sede' => $sedeConcepcionSegundo,
                    'usuario' => $vendedorConcepcion2,
                    'fecha' => now()->subDays(11),
                    'metodo_pago' => 'tarjeta',
                    'descuento' => 10,
                    'items' => [
                        ['producto' => 'Torta Beso de Ángel', 'cantidad' => 1],
                        ['producto' => 'Donut Glaseada Rosada', 'cantidad' => 4],
                    ],
                ],
                [
                    'cliente' => 4,
                    'sede' => $sedeHuancayoPrincipal,
                    'usuario' => $vendedorHuancayo,
                    'fecha' => now()->subDays(10),
                    'metodo_pago' => 'efectivo',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Cheesecake de Maracuyá', 'cantidad' => 2],
                        ['producto' => 'Milhojas', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 5,
                    'sede' => $sedeHuancayoSanCarlos,
                    'usuario' => $vendedorSanCarlos,
                    'fecha' => now()->subDays(9),
                    'metodo_pago' => 'yape',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Helado Popcorn', 'cantidad' => 3],
                        ['producto' => 'Muffin de Chocolate', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 6,
                    'sede' => $sedeConcepcionCentro,
                    'usuario' => $vendedorConcepcion1,
                    'fecha' => now()->subDays(8),
                    'metodo_pago' => 'plin',
                    'descuento' => 3,
                    'items' => [
                        ['producto' => 'Alfajor de Maracuyá', 'cantidad' => 4],
                        ['producto' => 'Donut Glaseada Amarilla', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 7,
                    'sede' => $sedeConcepcionSegundo,
                    'usuario' => $vendedorConcepcion2,
                    'fecha' => now()->subDays(7),
                    'metodo_pago' => 'efectivo',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Helado de Dos Sabores', 'cantidad' => 2],
                        ['producto' => 'Cupcake de Cereza', 'cantidad' => 3],
                    ],
                ],
                [
                    'cliente' => 8,
                    'sede' => $sedeHuancayoPrincipal,
                    'usuario' => $vendedorHuancayo,
                    'fecha' => now()->subDays(6),
                    'metodo_pago' => 'tarjeta',
                    'descuento' => 15,
                    'items' => [
                        ['producto' => 'Torta Personalizada', 'cantidad' => 1],
                    ],
                ],
                [
                    'cliente' => 9,
                    'sede' => $sedeHuancayoSanCarlos,
                    'usuario' => $vendedorSanCarlos,
                    'fecha' => now()->subDays(5),
                    'metodo_pago' => 'yape',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Torta de Chocolate', 'cantidad' => 1],
                        ['producto' => 'Alfajor de Mango', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 10,
                    'sede' => $sedeHuancayoPrincipal,
                    'usuario' => $vendedorHuancayo,
                    'fecha' => now()->subDays(4),
                    'metodo_pago' => 'plin',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Helado Artesanal', 'cantidad' => 4],
                    ],
                ],
                [
                    'cliente' => 11,
                    'sede' => $sedeConcepcionCentro,
                    'usuario' => $vendedorConcepcion1,
                    'fecha' => now()->subDays(3),
                    'metodo_pago' => 'efectivo',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Milhojas', 'cantidad' => 3],
                        ['producto' => 'Cheesecake de Maracuyá', 'cantidad' => 1],
                    ],
                ],
                [
                    'cliente' => 12,
                    'sede' => $sedeHuancayoPrincipal,
                    'usuario' => $vendedorHuancayo,
                    'fecha' => now()->subDays(2),
                    'metodo_pago' => 'tarjeta',
                    'descuento' => 8,
                    'items' => [
                        ['producto' => 'Donut Glaseada Rosada', 'cantidad' => 3],
                        ['producto' => 'Cupcake de Cereza', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 13,
                    'sede' => $sedeHuancayoSanCarlos,
                    'usuario' => $vendedorSanCarlos,
                    'fecha' => now()->subDay(),
                    'metodo_pago' => 'yape',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Helado Popcorn', 'cantidad' => 2],
                        ['producto' => 'Helado de Dos Sabores', 'cantidad' => 2],
                    ],
                ],
                [
                    'cliente' => 14,
                    'sede' => $sedeConcepcionSegundo,
                    'usuario' => $vendedorConcepcion2,
                    'fecha' => now(),
                    'metodo_pago' => 'efectivo',
                    'descuento' => 0,
                    'items' => [
                        ['producto' => 'Torta Tres Leches', 'cantidad' => 1],
                        ['producto' => 'Donut Glaseada Amarilla', 'cantidad' => 4],
                    ],
                ],
            ];

            foreach ($ventasData as $ventaData) {
                $cliente = $clientes[$ventaData['cliente']];
                $sede = $ventaData['sede'];
                $usuario = $ventaData['usuario'];
                $subtotalVenta = 0;
                $detallesPreparados = [];

                foreach ($ventaData['items'] as $item) {
                    $producto = $productos->firstWhere('nombre_producto', $item['producto']);

                    if (!$producto) {
                        continue;
                    }

                    $cantidad = $item['cantidad'];
                    $precioUnitario = $producto->precio;
                    $subtotalDetalle = $cantidad * $precioUnitario;

                    $subtotalVenta += $subtotalDetalle;

                    $detallesPreparados[] = [
                        'producto' => $producto,
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precioUnitario,
                        'subtotal' => $subtotalDetalle,
                    ];
                }

                $descuento = $ventaData['descuento'];
                $total = max($subtotalVenta - $descuento, 0);

                $venta = Venta::create([
                    'id_cliente' => $cliente->id_cliente,
                    'id_usuario' => $usuario->id_usuario,
                    'id_sede' => $sede->id_sede,
                    'fecha_venta' => Carbon::parse($ventaData['fecha']),
                    'subtotal' => $subtotalVenta,
                    'descuento' => $descuento,
                    'total' => $total,
                    'metodo_pago' => $ventaData['metodo_pago'],
                    'estado_venta' => 'completada',
                ]);

                foreach ($detallesPreparados as $detalle) {
                    DetalleVenta::create([
                        'id_venta' => $venta->id_venta,
                        'id_producto' => $detalle['producto']->id_producto,
                        'cantidad' => $detalle['cantidad'],
                        'precio_unitario' => $detalle['precio_unitario'],
                        'subtotal' => $detalle['subtotal'],
                    ]);

                    $stock = Stock::where('id_producto', $detalle['producto']->id_producto)
                        ->where('id_sede', $sede->id_sede)
                        ->lockForUpdate()
                        ->first();

                    if ($stock) {
                        $stockAnterior = $stock->cantidad;
                        $stockActual = max($stockAnterior - $detalle['cantidad'], 0);

                        $stock->update([
                            'cantidad' => $stockActual,
                        ]);

                        MovimientoStock::create([
                            'id_stock' => $stock->id_stock,
                            'id_usuario' => $usuario->id_usuario,
                            'tipo_movimiento' => 'salida',
                            'cantidad' => $detalle['cantidad'],
                            'stock_anterior' => $stockAnterior,
                            'stock_actual' => $stockActual,
                            'motivo' => 'Venta de ejemplo',
                        ]);
                    }
                }

                Pago::create([
                    'id_venta' => $venta->id_venta,
                    'id_pedido' => null,
                    'metodo_pago' => $ventaData['metodo_pago'],
                    'monto' => $total,
                    'fecha_pago' => $ventaData['fecha'],
                    'codigo_operacion' => strtoupper($ventaData['metodo_pago']) . '-' . str_pad($venta->id_venta, 6, '0', STR_PAD_LEFT),
                    'estado_pago' => 'pagado',
                    'observacion' => 'Pago generado como dato de ejemplo',
                ]);
            }
        });
    }
}