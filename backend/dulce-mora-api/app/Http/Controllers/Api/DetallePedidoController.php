<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetallePedido;
use Illuminate\Http\Request;

/**
 * Controlador: DetallePedidoController
 * Uso: CRUD API para detalle de pedidos.
 */
class DetallePedidoController extends Controller
{
    public function index()
    {
        $detalles = DetallePedido::with(['pedido', 'producto'])->get();

        return response()->json($detalles, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle = DetallePedido::create($request->only([
            'id_pedido',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de pedido registrado correctamente',
            'data' => $detalle,
        ], 201);
    }

    public function show($id)
    {
        $detalle = DetallePedido::with(['pedido', 'producto'])->find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de pedido no encontrado'], 404);
        }

        return response()->json($detalle, 200);
    }

    public function update(Request $request, $id)
    {
        $detalle = DetallePedido::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de pedido no encontrado'], 404);
        }

        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle->update($request->only([
            'id_pedido',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de pedido actualizado correctamente',
            'data' => $detalle,
        ], 200);
    }

    public function destroy($id)
    {
        $detalle = DetallePedido::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de pedido no encontrado'], 404);
        }

        $detalle->delete();

        return response()->json([
            'message' => 'Detalle de pedido eliminado correctamente',
        ], 200);
    }
}