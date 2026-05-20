<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovimientoStock;
use Illuminate\Http\Request;

/**
 * Controlador: MovimientoStockController
 * Uso: CRUD API para movimientos de inventario.
 */
class MovimientoStockController extends Controller
{
    public function index()
    {
        $movimientos = MovimientoStock::with(['stock.producto', 'stock.sede', 'usuario'])->get();

        return response()->json($movimientos, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_stock' => 'required|exists:stock,id_stock',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'tipo_movimiento' => 'required|string|max:30',
            'cantidad' => 'required|integer|min:1',
            'stock_anterior' => 'required|integer|min:0',
            'stock_actual' => 'required|integer|min:0',
            'motivo' => 'nullable|string|max:150',
        ]);

        $movimiento = MovimientoStock::create($request->only([
            'id_stock',
            'id_usuario',
            'tipo_movimiento',
            'cantidad',
            'stock_anterior',
            'stock_actual',
            'motivo',
        ]));

        return response()->json([
            'message' => 'Movimiento de stock registrado correctamente',
            'data' => $movimiento,
        ], 201);
    }

    public function show($id)
    {
        $movimiento = MovimientoStock::with(['stock.producto', 'stock.sede', 'usuario'])->find($id);

        if (!$movimiento) {
            return response()->json(['message' => 'Movimiento de stock no encontrado'], 404);
        }

        return response()->json($movimiento, 200);
    }

    public function update(Request $request, $id)
    {
        $movimiento = MovimientoStock::find($id);

        if (!$movimiento) {
            return response()->json(['message' => 'Movimiento de stock no encontrado'], 404);
        }

        $request->validate([
            'id_stock' => 'required|exists:stock,id_stock',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'tipo_movimiento' => 'required|string|max:30',
            'cantidad' => 'required|integer|min:1',
            'stock_anterior' => 'required|integer|min:0',
            'stock_actual' => 'required|integer|min:0',
            'motivo' => 'nullable|string|max:150',
        ]);

        $movimiento->update($request->only([
            'id_stock',
            'id_usuario',
            'tipo_movimiento',
            'cantidad',
            'stock_anterior',
            'stock_actual',
            'motivo',
        ]));

        return response()->json([
            'message' => 'Movimiento de stock actualizado correctamente',
            'data' => $movimiento,
        ], 200);
    }

    public function destroy($id)
    {
        $movimiento = MovimientoStock::find($id);

        if (!$movimiento) {
            return response()->json(['message' => 'Movimiento de stock no encontrado'], 404);
        }

        $movimiento->delete();

        return response()->json([
            'message' => 'Movimiento de stock eliminado correctamente',
        ], 200);
    }
}