<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetalleCompra;
use Illuminate\Http\Request;

/**
 * Controlador: DetalleCompraController
 * Uso: CRUD API para detalle de compras.
 */
class DetalleCompraController extends Controller
{
    public function index()
    {
        return response()->json(
            DetalleCompra::with(['compra', 'producto'])->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_compra' => 'required|exists:compras,id_compra',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle = DetalleCompra::create($request->only([
            'id_compra',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de compra registrado correctamente',
            'data' => $detalle,
        ], 201);
    }

    public function show($id)
    {
        $detalle = DetalleCompra::with(['compra', 'producto'])->find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de compra no encontrado'], 404);
        }

        return response()->json($detalle, 200);
    }

    public function update(Request $request, $id)
    {
        $detalle = DetalleCompra::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de compra no encontrado'], 404);
        }

        $request->validate([
            'id_compra' => 'required|exists:compras,id_compra',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle->update($request->only([
            'id_compra',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de compra actualizado correctamente',
            'data' => $detalle,
        ], 200);
    }

    public function destroy($id)
    {
        $detalle = DetalleCompra::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de compra no encontrado'], 404);
        }

        $detalle->delete();

        return response()->json([
            'message' => 'Detalle de compra eliminado correctamente',
        ], 200);
    }
}