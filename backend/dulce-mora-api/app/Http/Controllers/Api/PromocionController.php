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
        $promociones = Promocion::with('productos')
            ->withCount('productos')
            ->orderBy('id_promocion', 'desc')
            ->get();

        return response()->json($promociones, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_promocion' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:250',
            'tipo_descuento' => 'required|in:porcentaje,monto_fijo,combo,cumpleanos',
            'valor_descuento' => 'required|numeric|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'monto_minimo' => 'nullable|numeric|min:0',
            'estado' => 'nullable|boolean',
        ]);

        $promocion = Promocion::create([
            'nombre_promocion' => $request->nombre_promocion,
            'descripcion' => $request->descripcion,
            'tipo_descuento' => $request->tipo_descuento,
            'valor_descuento' => $request->valor_descuento,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'monto_minimo' => $request->monto_minimo,
            'estado' => $request->has('estado') ? $request->estado : true,
        ]);

        $promocion->load('productos');
        $promocion->loadCount('productos');

        return response()->json([
            'message' => 'Promoción registrada correctamente',
            'data' => $promocion,
        ], 201);
    }

    public function show($id)
    {
        $promocion = Promocion::with('productos')
            ->withCount('productos')
            ->find($id);

        if (!$promocion) {
            return response()->json([
                'message' => 'Promoción no encontrada',
            ], 404);
        }

        return response()->json($promocion, 200);
    }

    public function update(Request $request, $id)
    {
        $promocion = Promocion::find($id);

        if (!$promocion) {
            return response()->json([
                'message' => 'Promoción no encontrada',
            ], 404);
        }

        $request->validate([
            'nombre_promocion' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:250',
            'tipo_descuento' => 'required|in:porcentaje,monto_fijo,combo,cumpleanos',
            'valor_descuento' => 'required|numeric|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'monto_minimo' => 'nullable|numeric|min:0',
            'estado' => 'nullable|boolean',
        ]);

        $promocion->update([
            'nombre_promocion' => $request->nombre_promocion,
            'descripcion' => $request->descripcion,
            'tipo_descuento' => $request->tipo_descuento,
            'valor_descuento' => $request->valor_descuento,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'monto_minimo' => $request->monto_minimo,
            'estado' => $request->has('estado') ? $request->estado : $promocion->estado,
        ]);

        $promocion->load('productos');
        $promocion->loadCount('productos');

        return response()->json([
            'message' => 'Promoción actualizada correctamente',
            'data' => $promocion,
        ], 200);
    }

    public function destroy($id)
    {
        $promocion = Promocion::find($id);

        if (!$promocion) {
            return response()->json([
                'message' => 'Promoción no encontrada',
            ], 404);
        }

        /*
         * No se elimina físicamente porque puede quedar como historial
         * comercial o estar relacionada con productos/reportes.
         * Solo se cambia a estado inactivo.
         */
        $promocion->update([
            'estado' => false,
        ]);

        $promocion->load('productos');
        $promocion->loadCount('productos');

        return response()->json([
            'message' => 'Promoción desactivada correctamente',
            'data' => $promocion,
        ], 200);
    }

    public function cambiarEstado($id)
    {
        $promocion = Promocion::find($id);

        if (!$promocion) {
            return response()->json([
                'message' => 'Promoción no encontrada',
            ], 404);
        }

        $promocion->update([
            'estado' => !$promocion->estado,
        ]);

        $promocion->load('productos');
        $promocion->loadCount('productos');

        return response()->json([
            'message' => $promocion->estado
                ? 'Promoción activada correctamente'
                : 'Promoción desactivada correctamente',
            'data' => $promocion,
        ], 200);
    }
}