<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carrito;
use Illuminate\Http\Request;

/**
 * Controlador: CarritoController
 * Uso: CRUD API para carrito de compras.
 */
class CarritoController extends Controller
{
    public function index()
    {
        return response()->json(Carrito::with(['cliente', 'producto'])->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $carrito = Carrito::create($request->only([
            'id_cliente',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Producto agregado al carrito correctamente',
            'data' => $carrito,
        ], 201);
    }

    public function show($id)
    {
        $carrito = Carrito::with(['cliente', 'producto'])->find($id);

        if (!$carrito) {
            return response()->json(['message' => 'Registro de carrito no encontrado'], 404);
        }

        return response()->json($carrito, 200);
    }

    public function update(Request $request, $id)
    {
        $carrito = Carrito::find($id);

        if (!$carrito) {
            return response()->json(['message' => 'Registro de carrito no encontrado'], 404);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $carrito->update($request->only([
            'id_cliente',
            'id_producto',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]));

        return response()->json([
            'message' => 'Carrito actualizado correctamente',
            'data' => $carrito,
        ], 200);
    }

    public function destroy($id)
    {
        $carrito = Carrito::find($id);

        if (!$carrito) {
            return response()->json(['message' => 'Registro de carrito no encontrado'], 404);
        }

        $carrito->delete();

        return response()->json([
            'message' => 'Producto eliminado del carrito correctamente',
        ], 200);
    }
}