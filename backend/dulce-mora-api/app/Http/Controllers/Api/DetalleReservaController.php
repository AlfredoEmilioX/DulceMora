<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetalleReserva;
use Illuminate\Http\Request;

/**
 * Controlador: DetalleReservaController
 * Uso: CRUD API para detalle de reservas.
 */
class DetalleReservaController extends Controller
{
    public function index()
    {
        return response()->json(
            DetalleReserva::with(['reserva', 'producto'])->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_reserva' => 'required|exists:reservas,id_reserva',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle = DetalleReserva::create($request->only([
            'id_reserva',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de reserva registrado correctamente',
            'data' => $detalle,
        ], 201);
    }

    public function show($id)
    {
        $detalle = DetalleReserva::with(['reserva', 'producto'])->find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de reserva no encontrado'], 404);
        }

        return response()->json($detalle, 200);
    }

    public function update(Request $request, $id)
    {
        $detalle = DetalleReserva::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de reserva no encontrado'], 404);
        }

        $request->validate([
            'id_reserva' => 'required|exists:reservas,id_reserva',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $detalle->update($request->only([
            'id_reserva',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Detalle de reserva actualizado correctamente',
            'data' => $detalle,
        ], 200);
    }

    public function destroy($id)
    {
        $detalle = DetalleReserva::find($id);

        if (!$detalle) {
            return response()->json(['message' => 'Detalle de reserva no encontrado'], 404);
        }

        $detalle->delete();

        return response()->json([
            'message' => 'Detalle de reserva eliminado correctamente',
        ], 200);
    }
}