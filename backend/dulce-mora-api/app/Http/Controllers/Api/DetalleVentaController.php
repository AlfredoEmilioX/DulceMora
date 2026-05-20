<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetalleVenta;
use Illuminate\Http\Request;

/**
 * Controlador: DetalleVentaController
 * Uso: CRUD API para detalle de ventas.
 */
class DetalleVentaController extends Controller
{
    public function index()
    {
        $detalles = DetalleVenta::with(['venta', 'producto'])->get();

        return response()->json($detalles, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_venta' => 'required|exists:ventas,id_venta',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle = DetalleVenta::create($request->only([
            'id_venta',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de venta registrado correctamente',
            'data' => $detalle,
        ], 201);
    }

    public function show($id)
    {
        $detalle = DetalleVenta::with(['venta', 'producto'])->find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de venta no encontrado'], 404);
        }

        return response()->json($detalle, 200);
    }

    public function update(Request $request, $id)
    {
        $detalle = DetalleVenta::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de venta no encontrado'], 404);
        }

        $request->validate([
            'id_venta' => 'required|exists:ventas,id_venta',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle->update($request->only([
            'id_venta',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de venta actualizado correctamente',
            'data' => $detalle,
        ], 200);
    }

    public function destroy($id)
    {
        $detalle = DetalleVenta::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de venta no encontrado'], 404);
        }

        $detalle->delete();

        return response()->json([
            'message' => 'Detalle de venta eliminado correctamente',
        ], 200);
    }
}