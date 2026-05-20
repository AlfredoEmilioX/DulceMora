<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;

/**
 * Controlador: RolController
 * Uso: CRUD API para roles del sistema.
 */
class RolController extends Controller
{
    public function index()
    {
        return response()->json(Rol::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_rol' => 'required|string|max:50|unique:roles,nombre_rol',
            'descripcion' => 'nullable|string|max:150',
            'estado' => 'boolean',
        ]);

        $rol = Rol::create($request->only([
            'nombre_rol',
            'descripcion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Rol registrado correctamente',
            'data' => $rol,
        ], 201);
    }

    public function show($id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json(['message' => 'Rol no encontrado'], 404);
        }

        return response()->json($rol, 200);
    }

    public function update(Request $request, $id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json(['message' => 'Rol no encontrado'], 404);
        }

        $request->validate([
            'nombre_rol' => 'required|string|max:50|unique:roles,nombre_rol,' . $id . ',id_rol',
            'descripcion' => 'nullable|string|max:150',
            'estado' => 'boolean',
        ]);

        $rol->update($request->only([
            'nombre_rol',
            'descripcion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Rol actualizado correctamente',
            'data' => $rol,
        ], 200);
    }

    public function destroy($id)
    {
        $rol = Rol::find($id);

        if (!$rol) {
            return response()->json(['message' => 'Rol no encontrado'], 404);
        }

        $rol->delete();

        return response()->json([
            'message' => 'Rol eliminado correctamente',
        ], 200);
    }
}