<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Caja;
use Illuminate\Http\Request;

/**
 * Controlador: CajaController
 * Uso: CRUD API para apertura y cierre de caja.
 */
class CajaController extends Controller
{
    public function index()
    {
        return response()->json(Caja::with(['sede', 'usuario'])->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_sede' => 'required|exists:sedes,id_sede',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'fecha_apertura' => 'required|date',
            'fecha_cierre' => 'nullable|date',
            'monto_inicial' => 'required|numeric|min:0',
            'monto_final' => 'nullable|numeric|min:0',
            'total_ventas' => 'nullable|numeric|min:0',
            'estado_caja' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $caja = Caja::create($request->only([
            'id_sede',
            'id_usuario',
            'fecha_apertura',
            'fecha_cierre',
            'monto_inicial',
            'monto_final',
            'total_ventas',
            'estado_caja',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Caja registrada correctamente',
            'data' => $caja,
        ], 201);
    }

    public function show($id)
    {
        $caja = Caja::with(['sede', 'usuario'])->find($id);

        if (!$caja) {
            return response()->json(['message' => 'Caja no encontrada'], 404);
        }

        return response()->json($caja, 200);
    }

    public function update(Request $request, $id)
    {
        $caja = Caja::find($id);

        if (!$caja) {
            return response()->json(['message' => 'Caja no encontrada'], 404);
        }

        $request->validate([
            'id_sede' => 'required|exists:sedes,id_sede',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'fecha_apertura' => 'required|date',
            'fecha_cierre' => 'nullable|date',
            'monto_inicial' => 'required|numeric|min:0',
            'monto_final' => 'nullable|numeric|min:0',
            'total_ventas' => 'nullable|numeric|min:0',
            'estado_caja' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $caja->update($request->only([
            'id_sede',
            'id_usuario',
            'fecha_apertura',
            'fecha_cierre',
            'monto_inicial',
            'monto_final',
            'total_ventas',
            'estado_caja',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Caja actualizada correctamente',
            'data' => $caja,
        ], 200);
    }

    public function destroy($id)
    {
        $caja = Caja::find($id);

        if (!$caja) {
            return response()->json(['message' => 'Caja no encontrada'], 404);
        }

        $caja->delete();

        return response()->json([
            'message' => 'Caja eliminada correctamente',
        ], 200);
    }
}