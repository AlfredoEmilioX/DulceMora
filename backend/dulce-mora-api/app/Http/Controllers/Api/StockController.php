<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\Request;

/**
 * Controlador: StockController
 * Uso: CRUD API para stock por producto y sede.
 */
class StockController extends Controller
{
    public function index()
    {
        $stock = Stock::with(['producto', 'sede'])->get();

        return response()->json($stock, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'id_sede' => 'required|exists:sedes,id_sede',
            'cantidad' => 'required|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'estado' => 'boolean',
        ]);

        $stock = Stock::create($request->only([
            'id_producto',
            'id_sede',
            'cantidad',
            'stock_minimo',
            'estado',
        ]));

        return response()->json([
            'message' => 'Stock registrado correctamente',
            'data' => $stock,
        ], 201);
    }

    public function show($id)
    {
        $stock = Stock::with(['producto', 'sede'])->find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock no encontrado'], 404);
        }

        return response()->json($stock, 200);
    }

    public function update(Request $request, $id)
    {
        $stock = Stock::find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock no encontrado'], 404);
        }

        $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'id_sede' => 'required|exists:sedes,id_sede',
            'cantidad' => 'required|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'estado' => 'boolean',
        ]);

        $stock->update($request->only([
            'id_producto',
            'id_sede',
            'cantidad',
            'stock_minimo',
            'estado',
        ]));

        return response()->json([
            'message' => 'Stock actualizado correctamente',
            'data' => $stock,
        ], 200);
    }

    public function destroy($id)
    {
        $stock = Stock::find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock no encontrado'], 404);
        }

        $stock->delete();

        return response()->json([
            'message' => 'Stock eliminado correctamente',
        ], 200);
    }
}