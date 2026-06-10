<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

/**
 * Controlador: ProductoController
 * Uso: CRUD API para productos del catálogo general.
 */
class ProductoController extends Controller
{
    public function index()
    {
        $productos = Producto::with([
            'categoria',
            'stock.sede',
        ])
            ->orderBy('id_producto', 'desc')
            ->get();

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
            'estado' => 'nullable|boolean',
        ]);

        $producto = Producto::create([
            'id_categoria' => $request->id_categoria,
            'nombre_producto' => $request->nombre_producto,
            'descripcion' => $request->descripcion,
            'precio' => $request->precio,
            'imagen' => $request->imagen,
            'estado' => $request->has('estado') ? $request->estado : true,
        ]);

        $producto->load([
            'categoria',
            'stock.sede',
        ]);

        return response()->json([
            'message' => 'Producto registrado correctamente',
            'data' => $producto,
        ], 201);
    }

    public function show($id)
    {
        $producto = Producto::with([
            'categoria',
            'stock.sede',
        ])->find($id);

        if (!$producto) {
            return response()->json([
                'message' => 'Producto no encontrado',
            ], 404);
        }

        return response()->json($producto, 200);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'message' => 'Producto no encontrado',
            ], 404);
        }

        $request->validate([
            'id_categoria' => 'required|exists:categorias,id_categoria',
            'nombre_producto' => 'required|string|max:120',
            'descripcion' => 'nullable|string|max:250',
            'precio' => 'required|numeric|min:0',
            'imagen' => 'nullable|string|max:255',
            'estado' => 'nullable|boolean',
        ]);

        $producto->update([
            'id_categoria' => $request->id_categoria,
            'nombre_producto' => $request->nombre_producto,
            'descripcion' => $request->descripcion,
            'precio' => $request->precio,
            'imagen' => $request->imagen,
            'estado' => $request->has('estado') ? $request->estado : $producto->estado,
        ]);

        $producto->load([
            'categoria',
            'stock.sede',
        ]);

        return response()->json([
            'message' => 'Producto actualizado correctamente',
            'data' => $producto,
        ], 200);
    }

    public function destroy($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'message' => 'Producto no encontrado',
            ], 404);
        }

        /*
         * No se elimina físicamente porque el producto puede estar
         * relacionado con ventas, pedidos o movimientos de stock.
         * Solo se cambia el estado a inactivo.
         */
        $producto->update([
            'estado' => false,
        ]);

        $producto->load([
            'categoria',
            'stock.sede',
        ]);

        return response()->json([
            'message' => 'Producto desactivado correctamente',
            'data' => $producto,
        ], 200);
    }

    public function cambiarEstado($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json([
                'message' => 'Producto no encontrado',
            ], 404);
        }

        $producto->update([
            'estado' => !$producto->estado,
        ]);

        $producto->load([
            'categoria',
            'stock.sede',
        ]);

        return response()->json([
            'message' => $producto->estado
                ? 'Producto activado correctamente'
                : 'Producto desactivado correctamente',
            'data' => $producto,
        ], 200);
    }
}