<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromocionProducto;
use Illuminate\Http\Request;

/**
 * Controlador: PromocionProductoController
 * Uso: Relaciona promociones con productos.
 */
class PromocionProductoController extends Controller
{
    public function index()
    {
        $data = PromocionProducto::with(['promocion', 'producto'])
            ->orderBy('id_promocion_producto', 'desc')
            ->get();

        return response()->json($data, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_promocion' => 'required|exists:promociones,id_promocion',
            'id_producto' => 'required|exists:productos,id_producto',
        ]);

        $existe = PromocionProducto::where('id_promocion', $request->id_promocion)
            ->where('id_producto', $request->id_producto)
            ->first();

        if ($existe) {
            return response()->json([
                'message' => 'Este producto ya está asignado a la promoción.',
                'data' => $existe,
            ], 409);
        }

        $relacion = PromocionProducto::create([
            'id_promocion' => $request->id_promocion,
            'id_producto' => $request->id_producto,
        ]);

        $relacion->load(['promocion', 'producto']);

        return response()->json([
            'message' => 'Producto asignado a promoción correctamente',
            'data' => $relacion,
        ], 201);
    }

    public function show($id)
    {
        $relacion = PromocionProducto::with(['promocion', 'producto'])->find($id);

        if (!$relacion) {
            return response()->json([
                'message' => 'Relación no encontrada',
            ], 404);
        }

        return response()->json($relacion, 200);
    }

    public function update(Request $request, $id)
    {
        $relacion = PromocionProducto::find($id);

        if (!$relacion) {
            return response()->json([
                'message' => 'Relación no encontrada',
            ], 404);
        }

        $request->validate([
            'id_promocion' => 'required|exists:promociones,id_promocion',
            'id_producto' => 'required|exists:productos,id_producto',
        ]);

        $existe = PromocionProducto::where('id_promocion', $request->id_promocion)
            ->where('id_producto', $request->id_producto)
            ->where('id_promocion_producto', '!=', $id)
            ->first();

        if ($existe) {
            return response()->json([
                'message' => 'Este producto ya está asignado a la promoción.',
                'data' => $existe,
            ], 409);
        }

        $relacion->update([
            'id_promocion' => $request->id_promocion,
            'id_producto' => $request->id_producto,
        ]);

        $relacion->load(['promocion', 'producto']);

        return response()->json([
            'message' => 'Relación actualizada correctamente',
            'data' => $relacion,
        ], 200);
    }

    public function destroy($id)
    {
        $relacion = PromocionProducto::find($id);

        if (!$relacion) {
            return response()->json([
                'message' => 'Relación no encontrada',
            ], 404);
        }

        $relacion->delete();

        return response()->json([
            'message' => 'Producto retirado de la promoción correctamente',
        ], 200);
    }
}