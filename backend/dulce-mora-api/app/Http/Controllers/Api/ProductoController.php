<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

/**
 * Controlador: ProductoController
 * Uso: CRUD API para productos del catálogo.
 */
class ProductoController extends Controller
{
    public function index()
    {
        $productos = Producto::with('categoria')->get();

        return response()->json($productos, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_categoria' => 'required|exists:categorias,id_categoria',
            'nombre_producto' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:250',
            'precio' => 'required|numeric|min:0',
            'imagen' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ]);

        $producto = Producto::create($request->only([
            'id_categoria',
            'nombre_producto',
            'descripcion',
            'precio',
            'imagen',
            'estado',
        ]));

        return response()->json([
            'message' => 'Producto registrado correctamente',
            'data' => $producto,
        ], 201);
    }

    public function show($id)
    {
        $producto = Producto::with('categoria')->find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($producto, 200);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $request->validate([
            'id_categoria' => 'required|exists:categorias,id_categoria',
            'nombre_producto' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:250',
            'precio' => 'required|numeric|min:0',
            'imagen' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ]);

        $producto->update($request->only([
            'id_categoria',
            'nombre_producto',
            'descripcion',
            'precio',
            'imagen',
            'estado',
        ]));

        return response()->json([
            'message' => 'Producto actualizado correctamente',
            'data' => $producto,
        ], 200);
    }

    public function destroy($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $producto->delete();

        return response()->json([
            'message' => 'Producto eliminado correctamente',
        ], 200);
    }
}