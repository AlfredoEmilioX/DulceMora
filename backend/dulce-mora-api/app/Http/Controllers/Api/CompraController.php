<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Stock;
use App\Models\MovimientoStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controlador: CompraController
 * Uso: Registra compras a proveedores y actualiza stock por sede.
 */
class CompraController extends Controller
{
    public function index()
    {
        $compras = Compra::with([
            'proveedor',
            'usuario',
            'sede',
            'detalles.producto.categoria',
        ])
            ->orderBy('id_compra', 'desc')
            ->get();

        return response()->json($compras, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_proveedor' => 'required|exists:proveedores,id_proveedor',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_compra' => 'required|date',
            'tipo_comprobante' => 'nullable|string|max:30',
            'serie' => 'nullable|string|max:10',
            'numero' => 'nullable|string|max:20',
            'observacion' => 'nullable|string',

            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto' => 'required|exists:productos,id_producto',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        try {
            $compra = DB::transaction(function () use ($request) {
                $subtotal = 0;

                foreach ($request->detalles as $detalle) {
                    $subtotal += $detalle['cantidad'] * $detalle['precio_unitario'];
                }

                $igv = $request->igv ?? 0;
                $total = $subtotal + $igv;

                $compra = Compra::create([
                    'id_proveedor' => $request->id_proveedor,
                    'id_usuario' => $request->id_usuario,
                    'id_sede' => $request->id_sede,
                    'fecha_compra' => $request->fecha_compra,
                    'subtotal' => $subtotal,
                    'igv' => $igv,
                    'total' => $total,
                    'tipo_comprobante' => $request->tipo_comprobante,
                    'serie' => $request->serie,
                    'numero' => $request->numero,
                    'estado_compra' => 'registrada',
                    'observacion' => $request->observacion,
                ]);

                foreach ($request->detalles as $detalle) {
                    $cantidad = (int) $detalle['cantidad'];
                    $precioUnitario = (float) $detalle['precio_unitario'];
                    $subtotalDetalle = $cantidad * $precioUnitario;

                    DetalleCompra::create([
                        'id_compra' => $compra->id_compra,
                        'id_producto' => $detalle['id_producto'],
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precioUnitario,
                        'subtotal' => $subtotalDetalle,
                    ]);

                    $stock = Stock::where('id_producto', $detalle['id_producto'])
                        ->where('id_sede', $request->id_sede)
                        ->lockForUpdate()
                        ->first();

                    if (!$stock) {
                        $stock = Stock::create([
                            'id_producto' => $detalle['id_producto'],
                            'id_sede' => $request->id_sede,
                            'cantidad' => 0,
                            'stock_minimo' => 5,
                            'estado' => true,
                        ]);
                    }

                    $stockAnterior = (int) $stock->cantidad;
                    $stockActual = $stockAnterior + $cantidad;

                    $stock->update([
                        'cantidad' => $stockActual,
                        'estado' => true,
                    ]);

                    MovimientoStock::create([
                        'id_stock' => $stock->id_stock,
                        'id_usuario' => $request->id_usuario,
                        'tipo_movimiento' => 'entrada',
                        'cantidad' => $cantidad,
                        'stock_anterior' => $stockAnterior,
                        'stock_actual' => $stockActual,
                        'motivo' => 'Ingreso por compra #' . $compra->id_compra,
                    ]);
                }

                $compra->load([
                    'proveedor',
                    'usuario',
                    'sede',
                    'detalles.producto.categoria',
                ]);

                return $compra;
            });

            return response()->json([
                'message' => 'Compra registrada correctamente y stock actualizado',
                'data' => $compra,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo registrar la compra.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function show($id)
    {
        $compra = Compra::with([
            'proveedor',
            'usuario',
            'sede',
            'detalles.producto.categoria',
        ])->find($id);

        if (!$compra) {
            return response()->json([
                'message' => 'Compra no encontrada',
            ], 404);
        }

        return response()->json($compra, 200);
    }

    public function update(Request $request, $id)
    {
        $compra = Compra::find($id);

        if (!$compra) {
            return response()->json([
                'message' => 'Compra no encontrada',
            ], 404);
        }

        if ($compra->estado_compra === 'anulada') {
            return response()->json([
                'message' => 'No se puede editar una compra anulada.',
            ], 422);
        }

        $request->validate([
            'tipo_comprobante' => 'nullable|string|max:30',
            'serie' => 'nullable|string|max:10',
            'numero' => 'nullable|string|max:20',
            'observacion' => 'nullable|string',
        ]);

        /*
         * No se permite editar productos/cantidades desde aquí porque ya afectaron stock.
         * Si hubo error en inventario, se corrige con un ajuste en el módulo Inventario.
         */
        $compra->update([
            'tipo_comprobante' => $request->tipo_comprobante,
            'serie' => $request->serie,
            'numero' => $request->numero,
            'observacion' => $request->observacion,
        ]);

        $compra->load([
            'proveedor',
            'usuario',
            'sede',
            'detalles.producto.categoria',
        ]);

        return response()->json([
            'message' => 'Compra actualizada correctamente',
            'data' => $compra,
        ], 200);
    }

    public function destroy($id)
    {
        $compra = Compra::with('detalles')->find($id);

        if (!$compra) {
            return response()->json([
                'message' => 'Compra no encontrada',
            ], 404);
        }

        if ($compra->estado_compra === 'anulada') {
            return response()->json([
                'message' => 'La compra ya se encuentra anulada.',
            ], 422);
        }

        try {
            $compra = DB::transaction(function () use ($compra) {
                foreach ($compra->detalles as $detalle) {
                    $stock = Stock::where('id_producto', $detalle->id_producto)
                        ->where('id_sede', $compra->id_sede)
                        ->lockForUpdate()
                        ->first();

                    if (!$stock) {
                        abort(422, 'No existe stock para revertir esta compra.');
                    }

                    $stockAnterior = (int) $stock->cantidad;
                    $cantidad = (int) $detalle->cantidad;

                    if ($cantidad > $stockAnterior) {
                        abort(422, 'No hay stock suficiente para anular esta compra. Realiza un ajuste manual en inventario.');
                    }

                    $stockActual = $stockAnterior - $cantidad;

                    $stock->update([
                        'cantidad' => $stockActual,
                    ]);

                    MovimientoStock::create([
                        'id_stock' => $stock->id_stock,
                        'id_usuario' => $compra->id_usuario,
                        'tipo_movimiento' => 'salida',
                        'cantidad' => $cantidad,
                        'stock_anterior' => $stockAnterior,
                        'stock_actual' => $stockActual,
                        'motivo' => 'Anulación de compra #' . $compra->id_compra,
                    ]);
                }

                $compra->update([
                    'estado_compra' => 'anulada',
                ]);

                $compra->load([
                    'proveedor',
                    'usuario',
                    'sede',
                    'detalles.producto.categoria',
                ]);

                return $compra;
            });

            return response()->json([
                'message' => 'Compra anulada correctamente y stock revertido',
                'data' => $compra,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo anular la compra.',
            ], 422);
        }
    }
}