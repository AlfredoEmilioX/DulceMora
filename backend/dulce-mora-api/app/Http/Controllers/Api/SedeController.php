<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sede;
use Illuminate\Http\Request;

/**
 * Controlador: SedeController
 * Uso: CRUD API para sedes del negocio.
 */
class SedeController extends Controller
{
    public function index()
    {
        return response()->json(Sede::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_comercial' => 'required|string|max:100',
            'direccion' => 'required|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'boolean',
        ]);

        $sede = Sede::create($request->only([
            'nombre_comercial',
            'direccion',
            'telefono',
            'estado',
        ]));

        return response()->json([
            'message' => 'Sede registrada correctamente',
            'data' => $sede,
        ], 201);
    }

    public function show($id)
    {
        $sede = Sede::find($id);

        if (!$sede) {
            return response()->json(['message' => 'Sede no encontrada'], 404);
        }

        return response()->json($sede, 200);
    }

    public function update(Request $request, $id)
    {
        $sede = Sede::find($id);

        if (!$sede) {
            return response()->json(['message' => 'Sede no encontrada'], 404);
        }

        $request->validate([
            'nombre_comercial' => 'required|string|max:100',
            'direccion' => 'required|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'boolean',
        ]);

        $sede->update($request->only([
            'nombre_comercial',
            'direccion',
            'telefono',
            'estado',
        ]));

        return response()->json([
            'message' => 'Sede actualizada correctamente',
            'data' => $sede,
        ], 200);
    }

    public function destroy($id)
    {
        $sede = Sede::find($id);

        if (!$sede) {
            return response()->json(['message' => 'Sede no encontrada'], 404);
        }

        $sede->delete();

        return response()->json([
            'message' => 'Sede eliminada correctamente',
        ], 200);
    }
}