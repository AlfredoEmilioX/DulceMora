<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorito;
use Illuminate\Http\Request;

/**
 * Controlador: FavoritoController
 * Uso: CRUD API para productos favoritos de clientes.
 */
class FavoritoController extends Controller
{
    public function index()
    {
        return response()->json(Favorito::with(['cliente', 'producto'])->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_producto' => 'required|exists:productos,id_producto',
        ]);

        $favorito = Favorito::create($request->only([
            'id_cliente',
            'id_producto',
        ]));

        return response()->json([
            'message' => 'Favorito registrado correctamente',
            'data' => $favorito,
        ], 201);
    }

    public function show($id)
    {
        $favorito = Favorito::with(['cliente', 'producto'])->find($id);

        if (!$favorito) {
            return response()->json(['message' => 'Favorito no encontrado'], 404);
        }

        return response()->json($favorito, 200);
    }

    public function update(Request $request, $id)
    {
        $favorito = Favorito::find($id);

        if (!$favorito) {
            return response()->json(['message' => 'Favorito no encontrado'], 404);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'id_producto' => 'required|exists:productos,id_producto',
        ]);

        $favorito->update($request->only([
            'id_cliente',
            'id_producto',
        ]));

        return response()->json([
            'message' => 'Favorito actualizado correctamente',
            'data' => $favorito,
        ], 200);
    }

    public function destroy($id)
    {
        $favorito = Favorito::find($id);

        if (!$favorito) {
            return response()->json(['message' => 'Favorito no encontrado'], 404);
        }

        $favorito->delete();

        return response()->json([
            'message' => 'Favorito eliminado correctamente',
        ], 200);
    }
}