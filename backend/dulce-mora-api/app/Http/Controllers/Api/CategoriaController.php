<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;

/**
 * Controlador: CategoriaController
 * Uso: CRUD API para categorías de productos.
 */
class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(Categoria::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_categoria' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $categoria = Categoria::create($request->only([
            'nombre_categoria',
            'descripcion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Categoría registrada correctamente',
            'data' => $categoria,
        ], 201);
    }

    public function show($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada'], 404);
        }

        return response()->json($categoria, 200);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada'], 404);
        }

        $request->validate([
            'nombre_categoria' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $categoria->update($request->only([
            'nombre_categoria',
            'descripcion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Categoría actualizada correctamente',
            'data' => $categoria,
        ], 200);
    }

    public function destroy($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada'], 404);
        }

        $categoria->delete();

        return response()->json([
            'message' => 'Categoría eliminada correctamente',
        ], 200);
    }
}