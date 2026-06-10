<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\Request;

/**
 * Controlador: StockController
 * Uso: Gestiona stock por producto y sede.
 */
class StockController extends Controller
{
    public function index()
    {
        $stock = Stock::with([
            'producto.categoria',
            'sede',
        ])
            ->orderBy('id_sede')
            ->orderBy('id_producto')
            ->get();

        return response()->json($stock, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'id_sede' => 'required|exists:sedes,id_sede',
            'cantidad' => 'required|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'estado' => 'nullable|boolean',
        ]);

        $existe = Stock::where('id_producto', $request->id_producto)
            ->where('id_sede', $request->id_sede)
            ->first();

        if ($existe) {
            return response()->json([
                'message' => 'Este producto ya tiene stock registrado en esta sede.',
                'data' => $existe,
            ], 409);
        }

        $stock = Stock::create([
            'id_producto' => $request->id_producto,
            'id_sede' => $request->id_sede,
            'cantidad' => $request->cantidad,
            'stock_minimo' => $request->stock_minimo ?? 5,
            'estado' => $request->has('estado') ? $request->estado : true,
        ]);

        $stock->load(['producto.categoria', 'sede']);

        return response()->json([
            'message' => 'Stock registrado correctamente',
            'data' => $stock,
        ], 201);
    }

    public function show($id)
    {
        $stock = Stock::with([
            'producto.categoria',
            'sede',
        ])->find($id);

        if (!$stock) {
            return response()->json([
                'message' => 'Stock no encontrado',
            ], 404);
        }

        return response()->json($stock, 200);
    }

    public function update(Request $request, $id)
    {
        $stock = Stock::find($id);

        if (!$stock) {
            return response()->json([
                'message' => 'Stock no encontrado',
            ], 404);
        }

        $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'id_sede' => 'required|exists:sedes,id_sede',
            'cantidad' => 'required|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'estado' => 'nullable|boolean',
        ]);

        $duplicado = Stock::where('id_producto', $request->id_producto)
            ->where('id_sede', $request->id_sede)
            ->where('id_stock', '!=', $id)
            ->first();

        if ($duplicado) {
            return response()->json([
                'message' => 'Ya existe otro registro de stock para este producto en esta sede.',
                'data' => $duplicado,
            ], 409);
        }

        $stock->update([
            'id_producto' => $request->id_producto,
            'id_sede' => $request->id_sede,
            'cantidad' => $request->cantidad,
            'stock_minimo' => $request->stock_minimo ?? $stock->stock_minimo,
            'estado' => $request->has('estado') ? $request->estado : $stock->estado,
        ]);

        $stock->load(['producto.categoria', 'sede']);

        return response()->json([
            'message' => 'Stock actualizado correctamente',
            'data' => $stock,
        ], 200);
    }

    public function destroy($id)
    {
        $stock = Stock::find($id);

        if (!$stock) {
            return response()->json([
                'message' => 'Stock no encontrado',
            ], 404);
        }

        /*
         * No se elimina físicamente porque puede tener movimientos históricos.
         * Solo se desactiva el stock de ese producto en esa sede.
         */
        $stock->update([
            'estado' => false,
        ]);

        $stock->load(['producto.categoria', 'sede']);

        return response()->json([
            'message' => 'Stock desactivado correctamente',
            'data' => $stock,
        ], 200);
    }

    public function cambiarEstado($id)
    {
        $stock = Stock::find($id);

        if (!$stock) {
            return response()->json([
                'message' => 'Stock no encontrado',
            ], 404);
        }

        $stock->update([
            'estado' => !$stock->estado,
        ]);

        $stock->load(['producto.categoria', 'sede']);

        return response()->json([
            'message' => $stock->estado
                ? 'Stock activado correctamente'
                : 'Stock desactivado correctamente',
            'data' => $stock,
        ], 200);
    }

    public function stockBajo()
    {
        $stock = Stock::with([
            'producto.categoria',
            'sede',
        ])
            ->whereColumn('cantidad', '<=', 'stock_minimo')
            ->where('estado', true)
            ->orderBy('cantidad')
            ->get();

        return response()->json($stock, 200);
    }
}