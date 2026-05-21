<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;

/**
 * Controlador: ReservaController
 * Uso: CRUD API para reservas.
 */
class ReservaController extends Controller
{
    public function index()
    {
        return response()->json(
            Reserva::with(['cliente', 'sede', 'detalles.producto'])->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_reserva' => 'required|date',
            'fecha_recojo' => 'nullable|date',
            'subtotal' => 'required|numeric|min:0',
            'adelanto' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'estado_reserva' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $reserva = Reserva::create($request->only([
            'id_cliente',
            'id_sede',
            'fecha_reserva',
            'fecha_recojo',
            'subtotal',
            'adelanto',
            'total',
            'estado_reserva',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Reserva registrada correctamente',
            'data' => $reserva,
        ], 201);
    }

    public function show($id)
    {
        $reserva = Reserva::with(['cliente', 'sede', 'detalles.producto'])->find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        return response()->json($reserva, 200);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_reserva' => 'required|date',
            'fecha_recojo' => 'nullable|date',
            'subtotal' => 'required|numeric|min:0',
            'adelanto' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'estado_reserva' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $reserva->update($request->only([
            'id_cliente',
            'id_sede',
            'fecha_reserva',
            'fecha_recojo',
            'subtotal',
            'adelanto',
            'total',
            'estado_reserva',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Reserva actualizada correctamente',
            'data' => $reserva,
        ], 200);
    }

    public function destroy($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $reserva->delete();

        return response()->json([
            'message' => 'Reserva eliminada correctamente',
        ], 200);
    }
}