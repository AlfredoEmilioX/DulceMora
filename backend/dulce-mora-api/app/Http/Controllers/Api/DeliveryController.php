<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\Request;

/**
 * Controlador: DeliveryController
 * Uso: Consulta y actualiza entregas de pedidos.
 */
class DeliveryController extends Controller
{
    public function index()
    {
        $deliverys = Delivery::with([
            'pedido.cliente',
            'pedido.sede',
            'usuario',
        ])
            ->orderBy('id_delivery', 'desc')
            ->get();

        return response()->json($deliverys, 200);
    }

    public function show($id)
    {
        $delivery = Delivery::with([
            'pedido.cliente',
            'pedido.sede',
            'usuario',
        ])->find($id);

        if (!$delivery) {
            return response()->json([
                'message' => 'Delivery no encontrado',
            ], 404);
        }

        return response()->json($delivery, 200);
    }

    public function update(Request $request, $id)
    {
        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json([
                'message' => 'Delivery no encontrado',
            ], 404);
        }

        $request->validate([
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'direccion_entrega' => 'required|string|max:200',
            'referencia' => 'nullable|string|max:200',
            'costo_delivery' => 'nullable|numeric|min:0',
            'fecha_salida' => 'nullable|date',
            'fecha_entrega' => 'nullable|date',
            'estado_delivery' => 'nullable|in:pendiente,listo,en_camino,entregado,cancelado',
            'observacion' => 'nullable|string',
        ]);

        $delivery->update([
            'id_usuario' => $request->id_usuario,
            'direccion_entrega' => $request->direccion_entrega,
            'referencia' => $request->referencia,
            'costo_delivery' => $request->costo_delivery ?? 0,
            'fecha_salida' => $request->fecha_salida,
            'fecha_entrega' => $request->fecha_entrega,
            'estado_delivery' => $request->estado_delivery ?? $delivery->estado_delivery,
            'observacion' => $request->observacion,
        ]);

        $delivery->load([
            'pedido.cliente',
            'pedido.sede',
            'usuario',
        ]);

        return response()->json([
            'message' => 'Delivery actualizado correctamente',
            'data' => $delivery,
        ], 200);
    }

    public function store()
    {
        return response()->json([
            'message' => 'El delivery se registra desde el módulo de pedidos.',
        ], 405);
    }

    public function destroy()
    {
        return response()->json([
            'message' => 'El delivery no se elimina; se cambia a estado cancelado desde pedidos.',
        ], 405);
    }
}