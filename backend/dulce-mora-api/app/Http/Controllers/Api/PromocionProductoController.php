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
        $data = PromocionProducto::with(['promocion', 'producto'])->get();

        return response()->json($data, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_promocion' => 'required|exists:promociones,id_promocion',
            'id_producto' => 'required|exists:productos,id_producto',
        ]);

        $relacion = PromocionProducto::create($request->only([
            'id_promocion',
            'id_producto',
        ]));

        return response()->json([
            'message' => 'Producto asignado a promoción correctamente',
            'data' => $relacion,
        ], 201);
    }

    public function show($id)
    {
        $relacion = PromocionProducto::with(['promocion', 'producto'])->find($id);

        if (!$relacion) {
            return response()->json(['message' => 'Relación no encontrada'], 404);
        }

        return response()->json($relacion, 200);
    }

    public function update(Request $request, $id)
    {
        $relacion = PromocionProducto::find($id);

        if (!$relacion) {
            return response()->json(['message' => 'Relación no encontrada'], 404);
        }

        $request->validate([
            'id_promocion' => 'required|exists:promociones,id_promocion',
            'id_producto' => 'required|exists:productos,id_producto',
        ]);

        $relacion->update($request->only([
            'id_promocion',
            'id_producto',
        ]));

        return response()->json([
            'message' => 'Relación actualizada correctamente',
            'data' => $relacion,
        ], 200);
    }

    public function destroy($id)
    {
        $relacion = PromocionProducto::find($id);

        if (!$relacion) {
            return response()->json(['message' => 'Relación no encontrada'], 404);
        }

        $relacion->delete();

        return response()->json([
            'message' => 'Relación eliminada correctamente',
        ], 200);
    }
}