<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promocion;
use Illuminate\Http\Request;

/**
 * Controlador: PromocionController
 * Uso: CRUD API para promociones.
 */
class PromocionController extends Controller
{
    public function index()
    {
        return response()->json(Promocion::with('productos')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_promocion' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:250',
            'tipo_descuento' => 'required|string|max:30',
            'valor_descuento' => 'required|numeric|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'monto_minimo' => 'nullable|numeric|min:0',
            'estado' => 'boolean',
        ]);

        $promocion = Promocion::create($request->only([
            'nombre_promocion',
            'descripcion',
            'tipo_descuento',
            'valor_descuento',
            'fecha_inicio',
            'fecha_fin',
            'monto_minimo',
            'estado',
        ]));

        return response()->json([
            'message' => 'Promoción registrada correctamente',
            'data' => $promocion,
        ], 201);
    }

    public function show($id)
    {
        $promocion = Promocion::with('productos')->find($id);

        if (!$promocion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        return response()->json($promocion, 200);
    }

    public function update(Request $request, $id)
    {
        $promocion = Promocion::find($id);

        if (!$promocion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        $request->validate([
            'nombre_promocion' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:250',
            'tipo_descuento' => 'required|string|max:30',
            'valor_descuento' => 'required|numeric|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'monto_minimo' => 'nullable|numeric|min:0',
            'estado' => 'boolean',
        ]);

        $promocion->update($request->only([
            'nombre_promocion',
            'descripcion',
            'tipo_descuento',
            'valor_descuento',
            'fecha_inicio',
            'fecha_fin',
            'monto_minimo',
            'estado',
        ]));

        return response()->json([
            'message' => 'Promoción actualizada correctamente',
            'data' => $promocion,
        ], 200);
    }

    public function destroy($id)
    {
        $promocion = Promocion::find($id);

        if (!$promocion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        $promocion->delete();

        return response()->json([
            'message' => 'Promoción eliminada correctamente',
        ], 200);
    }
}