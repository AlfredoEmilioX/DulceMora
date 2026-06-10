<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\DetalleReserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controlador: ReservaController
 * Uso: Registra reservas de productos o pedidos programados.
 */
class ReservaController extends Controller
{
    public function index()
    {
        $reservas = Reserva::with([
            'cliente',
            'sede',
            'detalles.producto.categoria',
        ])
            ->orderBy('id_reserva', 'desc')
            ->get();

        return response()->json($reservas, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_reserva' => 'required|date',
            'fecha_recojo' => 'nullable|date|after_or_equal:fecha_reserva',
            'adelanto' => 'nullable|numeric|min:0',
            'observacion' => 'nullable|string',

            'detalles' => 'required|array|min:1',
            'detalles.*.id_producto' => 'required|exists:productos,id_producto',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        try {
            $reserva = DB::transaction(function () use ($request) {
                $subtotal = 0;

                foreach ($request->detalles as $detalle) {
                    $subtotal += $detalle['cantidad'] * $detalle['precio_unitario'];
                }

                $adelanto = $request->adelanto ?? 0;
                $total = $subtotal;

                if ($adelanto > $total) {
                    abort(422, 'El adelanto no puede ser mayor al total de la reserva.');
                }

                $reserva = Reserva::create([
                    'id_cliente' => $request->id_cliente,
                    'id_sede' => $request->id_sede,
                    'fecha_reserva' => $request->fecha_reserva,
                    'fecha_recojo' => $request->fecha_recojo,
                    'subtotal' => $subtotal,
                    'adelanto' => $adelanto,
                    'total' => $total,
                    'estado_reserva' => 'pendiente',
                    'observacion' => $request->observacion,
                ]);

                foreach ($request->detalles as $detalle) {
                    $cantidad = (int) $detalle['cantidad'];
                    $precioUnitario = (float) $detalle['precio_unitario'];

                    DetalleReserva::create([
                        'id_reserva' => $reserva->id_reserva,
                        'id_producto' => $detalle['id_producto'],
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precioUnitario,
                        'subtotal' => $cantidad * $precioUnitario,
                    ]);
                }

                $reserva->load([
                    'cliente',
                    'sede',
                    'detalles.producto.categoria',
                ]);

                return $reserva;
            });

            return response()->json([
                'message' => 'Reserva registrada correctamente',
                'data' => $reserva,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo registrar la reserva.',
            ], 422);
        }
    }

    public function show($id)
    {
        $reserva = Reserva::with([
            'cliente',
            'sede',
            'detalles.producto.categoria',
        ])->find($id);

        if (!$reserva) {
            return response()->json([
                'message' => 'Reserva no encontrada',
            ], 404);
        }

        return response()->json($reserva, 200);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'message' => 'Reserva no encontrada',
            ], 404);
        }

        if (in_array($reserva->estado_reserva, ['atendida', 'cancelada'])) {
            return response()->json([
                'message' => 'No se puede editar una reserva atendida o cancelada.',
            ], 422);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_reserva' => 'required|date',
            'fecha_recojo' => 'nullable|date|after_or_equal:fecha_reserva',
            'adelanto' => 'nullable|numeric|min:0',
            'observacion' => 'nullable|string',
        ]);

        if (($request->adelanto ?? 0) > $reserva->total) {
            return response()->json([
                'message' => 'El adelanto no puede ser mayor al total de la reserva.',
            ], 422);
        }

        $reserva->update([
            'id_cliente' => $request->id_cliente,
            'id_sede' => $request->id_sede,
            'fecha_reserva' => $request->fecha_reserva,
            'fecha_recojo' => $request->fecha_recojo,
            'adelanto' => $request->adelanto ?? 0,
            'observacion' => $request->observacion,
        ]);

        $reserva->load([
            'cliente',
            'sede',
            'detalles.producto.categoria',
        ]);

        return response()->json([
            'message' => 'Reserva actualizada correctamente',
            'data' => $reserva,
        ], 200);
    }

    public function destroy($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'message' => 'Reserva no encontrada',
            ], 404);
        }

        if ($reserva->estado_reserva === 'atendida') {
            return response()->json([
                'message' => 'No se puede eliminar una reserva atendida.',
            ], 422);
        }

        /*
         * No se elimina físicamente. Solo se cancela para conservar historial.
         */
        $reserva->update([
            'estado_reserva' => 'cancelada',
        ]);

        $reserva->load([
            'cliente',
            'sede',
            'detalles.producto.categoria',
        ]);

        return response()->json([
            'message' => 'Reserva cancelada correctamente',
            'data' => $reserva,
        ], 200);
    }

    public function cambiarEstado(Request $request, $id)
    {
        $request->validate([
            'estado_reserva' => 'required|in:pendiente,confirmada,atendida,cancelada',
        ]);

        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'message' => 'Reserva no encontrada',
            ], 404);
        }

        if ($reserva->estado_reserva === 'atendida') {
            return response()->json([
                'message' => 'La reserva ya fue atendida y no puede cambiar de estado.',
            ], 422);
        }

        if ($reserva->estado_reserva === 'cancelada') {
            return response()->json([
                'message' => 'La reserva está cancelada y no puede cambiar de estado.',
            ], 422);
        }

        $reserva->update([
            'estado_reserva' => $request->estado_reserva,
        ]);

        $reserva->load([
            'cliente',
            'sede',
            'detalles.producto.categoria',
        ]);

        return response()->json([
            'message' => 'Estado de la reserva actualizado correctamente',
            'data' => $reserva,
        ], 200);
    }
}