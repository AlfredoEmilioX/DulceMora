<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistorialEstadoPedido;
use Illuminate\Http\Request;

/**
 * Controlador: HistorialEstadoPedidoController
 * Uso: CRUD API para historial de estados de pedidos.
 */
class HistorialEstadoPedidoController extends Controller
{
    public function index()
    {
        return response()->json(
            HistorialEstadoPedido::with(['pedido', 'usuario'])->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'estado_anterior' => 'nullable|string|max:30',
            'estado_nuevo' => 'required|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $historial = HistorialEstadoPedido::create($request->only([
            'id_pedido',
            'id_usuario',
            'estado_anterior',
            'estado_nuevo',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Historial de estado registrado correctamente',
            'data' => $historial,
        ], 201);
    }

    public function show($id)
    {
        $historial = HistorialEstadoPedido::with(['pedido', 'usuario'])->find($id);

        if (!$historial) {
            return response()->json(['message' => 'Historial no encontrado'], 404);
        }

        return response()->json($historial, 200);
    }

    public function update(Request $request, $id)
    {
        $historial = HistorialEstadoPedido::find($id);

        if (!$historial) {
            return response()->json(['message' => 'Historial no encontrado'], 404);
        }

        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'estado_anterior' => 'nullable|string|max:30',
            'estado_nuevo' => 'required|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $historial->update($request->only([
            'id_pedido',
            'id_usuario',
            'estado_anterior',
            'estado_nuevo',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Historial de estado actualizado correctamente',
            'data' => $historial,
        ], 200);
    }

    public function destroy($id)
    {
        $historial = HistorialEstadoPedido::find($id);

        if (!$historial) {
            return response()->json(['message' => 'Historial no encontrado'], 404);
        }

        $historial->delete();

        return response()->json([
            'message' => 'Historial eliminado correctamente',
        ], 200);
    }
}