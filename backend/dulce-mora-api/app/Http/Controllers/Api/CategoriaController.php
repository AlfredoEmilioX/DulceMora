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
        $categorias = Categoria::withCount('productos')
            ->orderBy('id_categoria', 'desc')
            ->get();

        return response()->json($categorias, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_categoria' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'nullable|boolean',
        ]);

        $categoria = Categoria::create([
            'nombre_categoria' => $request->nombre_categoria,
            'descripcion' => $request->descripcion,
            'estado' => $request->has('estado') ? $request->estado : true,
        ]);

        $categoria->loadCount('productos');

        return response()->json([
            'message' => 'Categoría registrada correctamente',
            'data' => $categoria,
        ], 201);
    }

    public function show($id)
    {
        $categoria = Categoria::withCount('productos')->find($id);

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada',
            ], 404);
        }

        return response()->json($categoria, 200);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada',
            ], 404);
        }

        $request->validate([
            'nombre_categoria' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'nullable|boolean',
        ]);

        $categoria->update([
            'nombre_categoria' => $request->nombre_categoria,
            'descripcion' => $request->descripcion,
            'estado' => $request->has('estado') ? $request->estado : $categoria->estado,
        ]);

        $categoria->loadCount('productos');

        return response()->json([
            'message' => 'Categoría actualizada correctamente',
            'data' => $categoria,
        ], 200);
    }

    public function destroy($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada',
            ], 404);
        }

        /*
         * No se elimina físicamente porque la categoría puede tener
         * productos relacionados. Solo se cambia a estado inactivo.
         */
        $categoria->update([
            'estado' => false,
        ]);

        $categoria->loadCount('productos');

        return response()->json([
            'message' => 'Categoría desactivada correctamente',
            'data' => $categoria,
        ], 200);
    }

    public function cambiarEstado($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada',
            ], 404);
        }

        $categoria->update([
            'estado' => !$categoria->estado,
        ]);

        $categoria->loadCount('productos');

        return response()->json([
            'message' => $categoria->estado
                ? 'Categoría activada correctamente'
                : 'Categoría desactivada correctamente',
            'data' => $categoria,
        ], 200);
    }
}