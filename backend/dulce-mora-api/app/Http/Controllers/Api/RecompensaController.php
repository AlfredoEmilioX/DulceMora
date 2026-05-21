<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recompensa;
use Illuminate\Http\Request;

/**
 * Controlador: RecompensaController
 * Uso: CRUD API para recompensas de clientes.
 */
class RecompensaController extends Controller
{
    public function index()
    {
        return response()->json(Recompensa::with('cliente')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'puntos' => 'nullable|integer|min:0',
            'nivel' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $recompensa = Recompensa::create($request->only([
            'id_cliente',
            'puntos',
            'nivel',
            'descripcion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Recompensa registrada correctamente',
            'data' => $recompensa,
        ], 201);
    }

    public function show($id)
    {
        $recompensa = Recompensa::with('cliente')->find($id);

        if (!$recompensa) {
            return response()->json(['message' => 'Recompensa no encontrada'], 404);
        }

        return response()->json($recompensa, 200);
    }

    public function update(Request $request, $id)
    {
        $recompensa = Recompensa::find($id);

        if (!$recompensa) {
            return response()->json(['message' => 'Recompensa no encontrada'], 404);
        }

        $request->validate([
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'puntos' => 'nullable|integer|min:0',
            'nivel' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $recompensa->update($request->only([
            'id_cliente',
            'puntos',
            'nivel',
            'descripcion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Recompensa actualizada correctamente',
            'data' => $recompensa,
        ], 200);
    }

    public function destroy($id)
    {
        $recompensa = Recompensa::find($id);

        if (!$recompensa) {
            return response()->json(['message' => 'Recompensa no encontrada'], 404);
        }

        $recompensa->delete();

        return response()->json([
            'message' => 'Recompensa eliminada correctamente',
        ], 200);
    }
}