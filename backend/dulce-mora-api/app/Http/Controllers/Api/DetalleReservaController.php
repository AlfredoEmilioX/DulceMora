<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetalleReserva;

/**
 * Controlador: DetalleReservaController
 * Uso: Consulta detalles de reservas.
 */
class DetalleReservaController extends Controller
{
    public function index()
    {
        $detalles = DetalleReserva::with([
            'reserva.cliente',
            'reserva.sede',
            'producto.categoria',
        ])
            ->orderBy('id_detalle_reserva', 'desc')
            ->get();

        return response()->json($detalles, 200);
    }

    public function show($id)
    {
        $detalle = DetalleReserva::with([
            'reserva.cliente',
            'reserva.sede',
            'producto.categoria',
        ])->find($id);

        if (!$detalle) {
            return response()->json([
                'message' => 'Detalle de reserva no encontrado',
            ], 404);
        }

        return response()->json($detalle, 200);
    }

    public function store()
    {
        return response()->json([
            'message' => 'Los detalles se registran desde el módulo de reservas.',
        ], 405);
    }

    public function update()
    {
        return response()->json([
            'message' => 'Los detalles de reserva no se editan directamente.',
        ], 405);
    }

    public function destroy()
    {
        return response()->json([
            'message' => 'Los detalles de reserva no se eliminan directamente.',
        ], 405);
    }
}