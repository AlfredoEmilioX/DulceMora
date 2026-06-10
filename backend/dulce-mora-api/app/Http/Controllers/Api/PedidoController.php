<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\DetallePedido;
use App\Models\Delivery;
use App\Models\Stock;
use App\Models\MovimientoStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controlador: PedidoController
 * Uso: Registra pedidos para recojo o delivery.
 */
class PedidoController extends Controller
{
    public function index()
    {
        $pedidos = Pedido::with([
            'cliente',
            'usuario',
            'sede',
            'detalles.producto.categoria',
            'delivery.usuario',
        ])
            ->orderBy('id_pedido', 'desc')
            ->get();

        return response()->json($pedidos, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_pedido' => 'required|date',
            'fecha_entrega' => 'nullable|date|after_or_equal:fecha_pedido',
            'tipo_entrega' => 'required|in:recojo,delivery',
            'direccion_entrega' => 'nullable|string|max:200',
            'costo_envio' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'metodo_pago' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',

            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto' => 'required|exists:productos,id_producto',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',

            'referencia' => 'nullable|string|max:200',
        ]);

        if ($request->tipo_entrega === 'delivery' && !$request->direccion_entrega) {
            return response()->json([
                'message' => 'La dirección de entrega es obligatoria para delivery.',
            ], 422);
        }

        try {
            $pedido = DB::transaction(function () use ($request) {
                $subtotal = 0;

                foreach ($request->detalles as $detalle) {
                    $subtotal += $detalle['cantidad'] * $detalle['precio_unitario'];
                }

                $costoEnvio = $request->costo_envio ?? 0;
                $descuento = $request->descuento ?? 0;
                $total = $subtotal + $costoEnvio - $descuento;

                if ($total < 0) {
                    $total = 0;
                }

                $pedido = Pedido::create([
                    'id_cliente' => $request->id_cliente,
                    'id_usuario' => $request->id_usuario,
                    'id_sede' => $request->id_sede,
                    'fecha_pedido' => $request->fecha_pedido,
                    'fecha_entrega' => $request->fecha_entrega,
                    'tipo_entrega' => $request->tipo_entrega,
                    'direccion_entrega' => $request->direccion_entrega,
                    'subtotal' => $subtotal,
                    'costo_envio' => $costoEnvio,
                    'descuento' => $descuento,
                    'total' => $total,
                    'metodo_pago' => $request->metodo_pago,
                    'estado_pedido' => 'pendiente',
                    'observacion' => $request->observacion,
                ]);

                foreach ($request->detalles as $detalle) {
                    $cantidad = (int) $detalle['cantidad'];
                    $precioUnitario = (float) $detalle['precio_unitario'];

                    DetallePedido::create([
                        'id_pedido' => $pedido->id_pedido,
                        'id_producto' => $detalle['id_producto'],
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precioUnitario,
                        'subtotal' => $cantidad * $precioUnitario,
                    ]);
                }

                if ($request->tipo_entrega === 'delivery') {
                    Delivery::create([
                        'id_pedido' => $pedido->id_pedido,
                        'id_usuario' => $request->id_usuario,
                        'direccion_entrega' => $request->direccion_entrega,
                        'referencia' => $request->referencia,
                        'costo_delivery' => $costoEnvio,
                        'fecha_salida' => null,
                        'fecha_entrega' => null,
                        'estado_delivery' => 'pendiente',
                        'observacion' => $request->observacion,
                    ]);
                }

                $pedido->load([
                    'cliente',
                    'usuario',
                    'sede',
                    'detalles.producto.categoria',
                    'delivery.usuario',
                ]);

                return $pedido;
            });

            return response()->json([
                'message' => 'Pedido registrado correctamente',
                'data' => $pedido,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo registrar el pedido.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function show($id)
    {
        $pedido = Pedido::with([
            'cliente',
            'usuario',
            'sede',
            'detalles.producto.categoria',
            'delivery.usuario',
        ])->find($id);

        if (!$pedido) {
            return response()->json([
                'message' => 'Pedido no encontrado',
            ], 404);
        }

        return response()->json($pedido, 200);
    }

    public function update(Request $request, $id)
    {
        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json([
                'message' => 'Pedido no encontrado',
            ], 404);
        }

        if ($pedido->estado_pedido === 'entregado') {
            return response()->json([
                'message' => 'No se puede editar un pedido entregado porque ya afectó inventario.',
            ], 422);
        }

        if ($pedido->estado_pedido === 'cancelado') {
            return response()->json([
                'message' => 'No se puede editar un pedido cancelado.',
            ], 422);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_pedido' => 'required|date',
            'fecha_entrega' => 'nullable|date|after_or_equal:fecha_pedido',
            'tipo_entrega' => 'required|in:recojo,delivery',
            'direccion_entrega' => 'nullable|string|max:200',
            'costo_envio' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'metodo_pago' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        if ($request->tipo_entrega === 'delivery' && !$request->direccion_entrega) {
            return response()->json([
                'message' => 'La dirección de entrega es obligatoria para delivery.',
            ], 422);
        }

        $pedido->update([
            'id_cliente' => $request->id_cliente,
            'id_usuario' => $request->id_usuario,
            'id_sede' => $request->id_sede,
            'fecha_pedido' => $request->fecha_pedido,
            'fecha_entrega' => $request->fecha_entrega,
            'tipo_entrega' => $request->tipo_entrega,
            'direccion_entrega' => $request->direccion_entrega,
            'costo_envio' => $request->costo_envio ?? 0,
            'descuento' => $request->descuento ?? 0,
            'metodo_pago' => $request->metodo_pago,
            'observacion' => $request->observacion,
        ]);

        $pedido->load([
            'cliente',
            'usuario',
            'sede',
            'detalles.producto.categoria',
            'delivery.usuario',
        ]);

        return response()->json([
            'message' => 'Pedido actualizado correctamente',
            'data' => $pedido,
        ], 200);
    }

    public function destroy($id)
    {
        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json([
                'message' => 'Pedido no encontrado',
            ], 404);
        }

        if ($pedido->estado_pedido === 'entregado') {
            return response()->json([
                'message' => 'No se puede eliminar un pedido entregado. El inventario ya fue afectado.',
            ], 422);
        }

        $pedido->update([
            'estado_pedido' => 'cancelado',
        ]);

        if ($pedido->delivery) {
            $pedido->delivery->update([
                'estado_delivery' => 'cancelado',
            ]);
        }

        $pedido->load([
            'cliente',
            'usuario',
            'sede',
            'detalles.producto.categoria',
            'delivery.usuario',
        ]);

        return response()->json([
            'message' => 'Pedido cancelado correctamente',
            'data' => $pedido,
        ], 200);
    }

    public function cambiarEstado(Request $request, $id)
    {
        $request->validate([
            'estado_pedido' => 'required|in:pendiente,confirmado,en_preparacion,listo,entregado,cancelado',
        ]);

        $pedido = Pedido::with([
            'detalles.producto',
            'delivery',
        ])->find($id);

        if (!$pedido) {
            return response()->json([
                'message' => 'Pedido no encontrado',
            ], 404);
        }

        if ($pedido->estado_pedido === 'entregado') {
            return response()->json([
                'message' => 'El pedido ya fue entregado y no puede cambiar de estado.',
            ], 422);
        }

        if ($pedido->estado_pedido === 'cancelado') {
            return response()->json([
                'message' => 'El pedido está cancelado y no puede cambiar de estado.',
            ], 422);
        }

        try {
            $pedido = DB::transaction(function () use ($pedido, $request) {
                $nuevoEstado = $request->estado_pedido;

                if ($nuevoEstado === 'entregado') {
                    foreach ($pedido->detalles as $detalle) {
                        $stock = Stock::where('id_producto', $detalle->id_producto)
                            ->where('id_sede', $pedido->id_sede)
                            ->lockForUpdate()
                            ->first();

                        if (!$stock) {
                            abort(422, 'No existe stock para el producto: ' . $detalle->producto->nombre_producto);
                        }

                        if (!$stock->estado) {
                            abort(422, 'El stock está inactivo para el producto: ' . $detalle->producto->nombre_producto);
                        }

                        $stockAnterior = (int) $stock->cantidad;
                        $cantidad = (int) $detalle->cantidad;

                        if ($cantidad > $stockAnterior) {
                            abort(422, 'Stock insuficiente para el producto: ' . $detalle->producto->nombre_producto);
                        }

                        $stockActual = $stockAnterior - $cantidad;

                        $stock->update([
                            'cantidad' => $stockActual,
                        ]);

                        MovimientoStock::create([
                            'id_stock' => $stock->id_stock,
                            'id_usuario' => $pedido->id_usuario,
                            'tipo_movimiento' => 'salida',
                            'cantidad' => $cantidad,
                            'stock_anterior' => $stockAnterior,
                            'stock_actual' => $stockActual,
                            'motivo' => 'Salida por pedido entregado #' . $pedido->id_pedido,
                        ]);
                    }

                    if ($pedido->delivery) {
                        $pedido->delivery->update([
                            'estado_delivery' => 'entregado',
                            'fecha_entrega' => now(),
                        ]);
                    }
                }

                if ($nuevoEstado === 'cancelado' && $pedido->delivery) {
                    $pedido->delivery->update([
                        'estado_delivery' => 'cancelado',
                    ]);
                }

                if ($nuevoEstado === 'en_preparacion' && $pedido->delivery) {
                    $pedido->delivery->update([
                        'estado_delivery' => 'pendiente',
                    ]);
                }

                if ($nuevoEstado === 'listo' && $pedido->delivery) {
                    $pedido->delivery->update([
                        'estado_delivery' => 'listo',
                    ]);
                }

                $pedido->update([
                    'estado_pedido' => $nuevoEstado,
                ]);

                $pedido->load([
                    'cliente',
                    'usuario',
                    'sede',
                    'detalles.producto.categoria',
                    'delivery.usuario',
                ]);

                return $pedido;
            });

            return response()->json([
                'message' => 'Estado del pedido actualizado correctamente',
                'data' => $pedido,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo cambiar el estado del pedido.',
            ], 422);
        }
    }
}