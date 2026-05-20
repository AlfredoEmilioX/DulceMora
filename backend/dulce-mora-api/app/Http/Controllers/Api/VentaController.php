<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use Illuminate\Http\Request;

/**
 * Controlador: VentaController
 * Uso: CRUD API para ventas.
 */
class VentaController extends Controller
{
    public function index()
    {
        $ventas = Venta::with(['cliente', 'usuario', 'sede', 'detalles.producto'])->get();

        return response()->json($ventas, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'nullable|exists:clientes,id_cliente',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_venta' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metodo_pago' => 'required|string|max:30',
            'estado_venta' => 'nullable|string|max:30',
        ]);

        $venta = Venta::create($request->only([
            'id_cliente',
            'id_usuario',
            'id_sede',
            'fecha_venta',
            'subtotal',
            'descuento',
            'total',
            'metodo_pago',
            'estado_venta',
        ]));

        return response()->json([
            'message' => 'Venta registrada correctamente',
            'data' => $venta,
        ], 201);
    }

    public function show($id)
    {
        $venta = Venta::with(['cliente', 'usuario', 'sede', 'detalles.producto'])->find($id);

        if (!$venta) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        return response()->json($venta, 200);
    }

    public function update(Request $request, $id)
    {
        $venta = Venta::find($id);

        if (!$venta) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        $request->validate([
            'id_cliente' => 'nullable|exists:clientes,id_cliente',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_venta' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metodo_pago' => 'required|string|max:30',
            'estado_venta' => 'nullable|string|max:30',
        ]);

        $venta->update($request->only([
            'id_cliente',
            'id_usuario',
            'id_sede',
            'fecha_venta',
            'subtotal',
            'descuento',
            'total',
            'metodo_pago',
            'estado_venta',
        ]));

        return response()->json([
            'message' => 'Venta actualizada correctamente',
            'data' => $venta,
        ], 200);
    }

    public function destroy($id)
    {
        $venta = Venta::find($id);

        if (!$venta) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        $venta->delete();

        return response()->json([
            'message' => 'Venta eliminada correctamente',
        ], 200);
    }
}