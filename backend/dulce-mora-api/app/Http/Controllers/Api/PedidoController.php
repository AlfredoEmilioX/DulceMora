<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;

/**
 * Controlador: PedidoController
 * Uso: CRUD API para pedidos.
 */
class PedidoController extends Controller
{
    public function index()
    {
        $pedidos = Pedido::with(['cliente', 'usuario', 'sede', 'detalles.producto'])->get();

        return response()->json($pedidos, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_pedido' => 'required|date',
            'fecha_entrega' => 'nullable|date',
            'tipo_entrega' => 'required|string|max:30',
            'direccion_entrega' => 'nullable|string|max:200',
            'subtotal' => 'required|numeric|min:0',
            'costo_envio' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metodo_pago' => 'nullable|string|max:30',
            'estado_pedido' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $pedido = Pedido::create($request->only([
            'id_cliente',
            'id_usuario',
            'id_sede',
            'fecha_pedido',
            'fecha_entrega',
            'tipo_entrega',
            'direccion_entrega',
            'subtotal',
            'costo_envio',
            'descuento',
            'total',
            'metodo_pago',
            'estado_pedido',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Pedido registrado correctamente',
            'data' => $pedido,
        ], 201);
    }

    public function show($id)
    {
        $pedido = Pedido::with(['cliente', 'usuario', 'sede', 'detalles.producto'])->find($id);

        if (!$pedido) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        return response()->json($pedido, 200);
    }

    public function update(Request $request, $id)
    {
        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_pedido' => 'required|date',
            'fecha_entrega' => 'nullable|date',
            'tipo_entrega' => 'required|string|max:30',
            'direccion_entrega' => 'nullable|string|max:200',
            'subtotal' => 'required|numeric|min:0',
            'costo_envio' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metodo_pago' => 'nullable|string|max:30',
            'estado_pedido' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $pedido->update($request->only([
            'id_cliente',
            'id_usuario',
            'id_sede',
            'fecha_pedido',
            'fecha_entrega',
            'tipo_entrega',
            'direccion_entrega',
            'subtotal',
            'costo_envio',
            'descuento',
            'total',
            'metodo_pago',
            'estado_pedido',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Pedido actualizado correctamente',
            'data' => $pedido,
        ], 200);
    }

    public function destroy($id)
    {
        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $pedido->delete();

        return response()->json([
            'message' => 'Pedido eliminado correctamente',
        ], 200);
    }
}