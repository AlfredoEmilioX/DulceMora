<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opinion;
use Illuminate\Http\Request;

/**
 * Controlador: OpinionController
 * Uso: CRUD API para opiniones de productos.
 */
class OpinionController extends Controller
{
    public function index()
    {
        return response()->json(
            Opinion::with(['cliente', 'producto'])->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_producto' => 'required|exists:productos,id_producto',
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string',
            'estado' => 'boolean',
        ]);

        $opinion = Opinion::create($request->only([
            'id_cliente',
            'id_producto',
            'calificacion',
            'comentario',
            'estado',
        ]));

        return response()->json([
            'message' => 'Opinión registrada correctamente',
            'data' => $opinion,
        ], 201);
    }

    public function show($id)
    {
        $opinion = Opinion::with(['cliente', 'producto'])->find($id);

        if (!$opinion) {
            return response()->json(['message' => 'Opinión no encontrada'], 404);
        }

        return response()->json($opinion, 200);
    }

    public function update(Request $request, $id)
    {
        $opinion = Opinion::find($id);

        if (!$opinion) {
            return response()->json(['message' => 'Opinión no encontrada'], 404);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_producto' => 'required|exists:productos,id_producto',
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string',
            'estado' => 'boolean',
        ]);

        $opinion->update($request->only([
            'id_cliente',
            'id_producto',
            'calificacion',
            'comentario',
            'estado',
        ]));

        return response()->json([
            'message' => 'Opinión actualizada correctamente',
            'data' => $opinion,
        ], 200);
    }

    public function destroy($id)
    {
        $opinion = Opinion::find($id);

        if (!$opinion) {
            return response()->json(['message' => 'Opinión no encontrada'], 404);
        }

        $opinion->delete();

        return response()->json([
            'message' => 'Opinión eliminada correctamente',
        ], 200);
    }
}