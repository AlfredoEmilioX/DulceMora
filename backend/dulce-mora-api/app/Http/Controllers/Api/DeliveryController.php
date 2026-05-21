<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\Request;

/**
 * Controlador: DeliveryController
 * Uso: CRUD API para entregas de pedidos.
 */
class DeliveryController extends Controller
{
    public function index()
    {
        return response()->json(
            Delivery::with(['pedido', 'usuario'])->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'direccion_entrega' => 'required|string|max:200',
            'referencia' => 'nullable|string|max:200',
            'costo_delivery' => 'nullable|numeric|min:0',
            'fecha_salida' => 'nullable|date',
            'fecha_entrega' => 'nullable|date',
            'estado_delivery' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $delivery = Delivery::create($request->only([
            'id_pedido',
            'id_usuario',
            'direccion_entrega',
            'referencia',
            'costo_delivery',
            'fecha_salida',
            'fecha_entrega',
            'estado_delivery',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Delivery registrado correctamente',
            'data' => $delivery,
        ], 201);
    }

    public function show($id)
    {
        $delivery = Delivery::with(['pedido', 'usuario'])->find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery no encontrado'], 404);
        }

        return response()->json($delivery, 200);
    }

    public function update(Request $request, $id)
    {
        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery no encontrado'], 404);
        }

        $request->validate([
            'id_pedido' => 'required|exists:pedidos,id_pedido',
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'direccion_entrega' => 'required|string|max:200',
            'referencia' => 'nullable|string|max:200',
            'costo_delivery' => 'nullable|numeric|min:0',
            'fecha_salida' => 'nullable|date',
            'fecha_entrega' => 'nullable|date',
            'estado_delivery' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $delivery->update($request->only([
            'id_pedido',
            'id_usuario',
            'direccion_entrega',
            'referencia',
            'costo_delivery',
            'fecha_salida',
            'fecha_entrega',
            'estado_delivery',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Delivery actualizado correctamente',
            'data' => $delivery,
        ], 200);
    }

    public function destroy($id)
    {
        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json(['message' => 'Delivery no encontrado'], 404);
        }

        $delivery->delete();

        return response()->json([
            'message' => 'Delivery eliminado correctamente',
        ], 200);
    }
}