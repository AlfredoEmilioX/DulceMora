<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use Illuminate\Http\Request;

/**
 * Controlador: PagoController
 * Uso: CRUD API para pagos de ventas o pedidos.
 */
class PagoController extends Controller
{
    public function index()
    {
        return response()->json(Pago::with(['venta', 'pedido'])->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_venta' => 'nullable|exists:ventas,id_venta',
            'id_pedido' => 'nullable|exists:pedidos,id_pedido',
            'metodo_pago' => 'required|string|max:30',
            'monto' => 'required|numeric|min:0',
            'fecha_pago' => 'required|date',
            'codigo_operacion' => 'nullable|string|max:80',
            'estado_pago' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        if (!$request->id_venta && !$request->id_pedido) {
            return response()->json([
                'message' => 'Debe asociar el pago a una venta o a un pedido'
            ], 422);
        }

        $pago = Pago::create($request->only([
            'id_venta',
            'id_pedido',
            'metodo_pago',
            'monto',
            'fecha_pago',
            'codigo_operacion',
            'estado_pago',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Pago registrado correctamente',
            'data' => $pago,
        ], 201);
    }

    public function show($id)
    {
        $pago = Pago::with(['venta', 'pedido'])->find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        return response()->json($pago, 200);
    }

    public function update(Request $request, $id)
    {
        $pago = Pago::find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        $request->validate([
            'id_venta' => 'nullable|exists:ventas,id_venta',
            'id_pedido' => 'nullable|exists:pedidos,id_pedido',
            'metodo_pago' => 'required|string|max:30',
            'monto' => 'required|numeric|min:0',
            'fecha_pago' => 'required|date',
            'codigo_operacion' => 'nullable|string|max:80',
            'estado_pago' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        if (!$request->id_venta && !$request->id_pedido) {
            return response()->json([
                'message' => 'Debe asociar el pago a una venta o a un pedido'
            ], 422);
        }

        $pago->update($request->only([
            'id_venta',
            'id_pedido',
            'metodo_pago',
            'monto',
            'fecha_pago',
            'codigo_operacion',
            'estado_pago',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Pago actualizado correctamente',
            'data' => $pago,
        ], 200);
    }

    public function destroy($id)
    {
        $pago = Pago::find($id);

        if (!$pago) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        $pago->delete();

        return response()->json([
            'message' => 'Pago eliminado correctamente',
        ], 200);
    }
}