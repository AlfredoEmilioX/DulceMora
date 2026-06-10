<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovimientoStock;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controlador: MovimientoStockController
 * Uso: Registra movimientos de inventario y actualiza el stock real.
 */
class MovimientoStockController extends Controller
{
    public function index()
    {
        $movimientos = MovimientoStock::with([
            'stock.producto.categoria',
            'stock.sede',
            'usuario',
        ])
            ->orderBy('id_movimiento_stock', 'desc')
            ->get();

        return response()->json($movimientos, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_stock' => 'required|exists:stock,id_stock',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'tipo_movimiento' => 'required|in:entrada,salida,ajuste',
            'cantidad' => 'required|integer|min:0',
            'motivo' => 'nullable|string|max:150',
        ]);

        if ($request->tipo_movimiento !== 'ajuste' && $request->cantidad <= 0) {
            return response()->json([
                'message' => 'La cantidad debe ser mayor a 0 para entradas o salidas.',
            ], 422);
        }

        try {
            $movimiento = DB::transaction(function () use ($request) {
                $stock = Stock::where('id_stock', $request->id_stock)
                    ->lockForUpdate()
                    ->first();

                if (!$stock) {
                    abort(404, 'Stock no encontrado');
                }

                if (!$stock->estado) {
                    abort(422, 'No se puede mover stock de un registro inactivo.');
                }

                $stockAnterior = (int) $stock->cantidad;
                $cantidad = (int) $request->cantidad;

                if ($request->tipo_movimiento === 'entrada') {
                    $stockActual = $stockAnterior + $cantidad;
                } elseif ($request->tipo_movimiento === 'salida') {
                    if ($cantidad > $stockAnterior) {
                        abort(422, 'No hay stock suficiente para realizar la salida.');
                    }

                    $stockActual = $stockAnterior - $cantidad;
                } else {
                    /*
                     * En ajuste, la cantidad enviada representa el nuevo stock final.
                     * Ejemplo: si cantidad = 20, el stock queda en 20.
                     */
                    $stockActual = $cantidad;
                }

                $stock->update([
                    'cantidad' => $stockActual,
                ]);

                $movimiento = MovimientoStock::create([
                    'id_stock' => $stock->id_stock,
                    'id_usuario' => $request->id_usuario,
                    'tipo_movimiento' => $request->tipo_movimiento,
                    'cantidad' => $cantidad,
                    'stock_anterior' => $stockAnterior,
                    'stock_actual' => $stockActual,
                    'motivo' => $request->motivo,
                ]);

                $movimiento->load([
                    'stock.producto.categoria',
                    'stock.sede',
                    'usuario',
                ]);

                return $movimiento;
            });

            return response()->json([
                'message' => 'Movimiento de stock registrado correctamente',
                'data' => $movimiento,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo registrar el movimiento de stock.',
            ], 422);
        }
    }

    public function show($id)
    {
        $movimiento = MovimientoStock::with([
            'stock.producto.categoria',
            'stock.sede',
            'usuario',
        ])->find($id);

        if (!$movimiento) {
            return response()->json([
                'message' => 'Movimiento de stock no encontrado',
            ], 404);
        }

        return response()->json($movimiento, 200);
    }

    public function update(Request $request, $id)
    {
        /*
         * Por seguridad, los movimientos de stock no deberían editarse,
         * porque son parte del historial del inventario.
         */
        return response()->json([
            'message' => 'Los movimientos de stock no se pueden editar. Registra un nuevo ajuste si necesitas corregir el inventario.',
        ], 405);
    }

    public function destroy($id)
    {
        /*
         * Por seguridad, los movimientos de stock no deberían eliminarse,
         * porque sirven como historial de auditoría.
         */
        return response()->json([
            'message' => 'Los movimientos de stock no se pueden eliminar porque forman parte del historial de inventario.',
        ], 405);
    }
}