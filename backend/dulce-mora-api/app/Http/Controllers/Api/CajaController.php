<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Caja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controlador: CajaController
 * Uso: Gestiona apertura, cierre, listado y control de cajas.
 */
class CajaController extends Controller
{
    /**
     * Lista todas las cajas con sede y usuario.
     */
    public function index()
    {
        $cajas = Caja::with(['sede', 'usuario'])
            ->orderBy('id_caja', 'desc')
            ->get();

        return response()->json($cajas, 200);
    }

    /**
     * Resumen para tarjetas del módulo Cajas.
     */
    public function resumen()
    {
        $totalCajas = Caja::count();

        $cajasAbiertas = Caja::where('estado_caja', 'abierta')->count();

        $cajasCerradas = Caja::where('estado_caja', 'cerrada')->count();

        $montoTotalActual = Caja::where('estado_caja', 'abierta')
            ->sum(DB::raw('monto_inicial + total_ventas'));

        return response()->json([
            'total_cajas' => $totalCajas,
            'cajas_abiertas' => $cajasAbiertas,
            'cajas_cerradas' => $cajasCerradas,
            'monto_total_actual' => number_format($montoTotalActual, 2, '.', ''),
        ], 200);
    }

    /**
     * Registra la apertura de una caja.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_sede' => 'required|exists:sedes,id_sede',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'monto_inicial' => 'required|numeric|min:0',
            'observacion' => 'nullable|string|max:500',
        ]);

        $cajaAbierta = Caja::where('id_sede', $request->id_sede)
            ->where('estado_caja', 'abierta')
            ->first();

        if ($cajaAbierta) {
            return response()->json([
                'message' => 'Ya existe una caja abierta para esta sede.',
            ], 422);
        }

        $caja = Caja::create([
            'id_sede' => $request->id_sede,
            'id_usuario' => $request->id_usuario,
            'fecha_apertura' => now(),
            'fecha_cierre' => null,
            'monto_inicial' => $request->monto_inicial,
            'monto_final' => null,
            'total_ventas' => 0,
            'estado_caja' => 'abierta',
            'observacion' => $request->observacion,
        ]);

        return response()->json([
            'message' => 'Caja aperturada correctamente.',
            'data' => $caja->load(['sede', 'usuario']),
        ], 201);
    }

    /**
     * Muestra una caja específica.
     */
    public function show($id)
    {
        $caja = Caja::with(['sede', 'usuario'])->find($id);

        if (!$caja) {
            return response()->json([
                'message' => 'Caja no encontrada.',
            ], 404);
        }

        return response()->json($caja, 200);
    }

    /**
     * Actualiza datos básicos de una caja.
     * Solo se recomienda permitir edición si la caja está abierta.
     */
    public function update(Request $request, $id)
    {
        $caja = Caja::find($id);

        if (!$caja) {
            return response()->json([
                'message' => 'Caja no encontrada.',
            ], 404);
        }

        if ($caja->estado_caja === 'cerrada') {
            return response()->json([
                'message' => 'No se puede editar una caja cerrada.',
            ], 422);
        }

        $request->validate([
            'id_sede' => 'required|exists:sedes,id_sede',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'monto_inicial' => 'required|numeric|min:0',
            'observacion' => 'nullable|string|max:500',
        ]);

        $caja->update([
            'id_sede' => $request->id_sede,
            'id_usuario' => $request->id_usuario,
            'monto_inicial' => $request->monto_inicial,
            'observacion' => $request->observacion,
        ]);

        return response()->json([
            'message' => 'Caja actualizada correctamente.',
            'data' => $caja->load(['sede', 'usuario']),
        ], 200);
    }

    /**
     * Cierra una caja abierta.
     */
    public function cerrar(Request $request, $id)
    {
        $caja = Caja::find($id);

        if (!$caja) {
            return response()->json([
                'message' => 'Caja no encontrada.',
            ], 404);
        }

        if ($caja->estado_caja !== 'abierta') {
            return response()->json([
                'message' => 'Solo se puede cerrar una caja que está abierta.',
            ], 422);
        }

        $request->validate([
            'monto_final' => 'required|numeric|min:0',
            'observacion' => 'nullable|string|max:500',
        ]);

        $caja->update([
            'fecha_cierre' => now(),
            'monto_final' => $request->monto_final,
            'estado_caja' => 'cerrada',
            'observacion' => $request->observacion ?? $caja->observacion,
        ]);

        return response()->json([
            'message' => 'Caja cerrada correctamente.',
            'data' => $caja->load(['sede', 'usuario']),
        ], 200);
    }

    /**
     * Anula una caja.
     * Mejor que eliminar físicamente.
     */
    public function destroy($id)
    {
        $caja = Caja::find($id);

        if (!$caja) {
            return response()->json([
                'message' => 'Caja no encontrada.',
            ], 404);
        }

        if ($caja->estado_caja === 'cerrada') {
            return response()->json([
                'message' => 'No se puede anular una caja cerrada.',
            ], 422);
        }

        $caja->update([
            'estado_caja' => 'anulada',
            'fecha_cierre' => now(),
        ]);

        return response()->json([
            'message' => 'Caja anulada correctamente.',
        ], 200);
    }
}