<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SesionUsuario;
use Illuminate\Http\Request;

/**
 * Controlador: SesionUsuarioController
 * Uso: CRUD API para sesiones de usuarios.
 */
class SesionUsuarioController extends Controller
{
    public function index()
    {
        return response()->json(SesionUsuario::with('usuario')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'token' => 'nullable|string|max:255',
            'ip' => 'nullable|string|max:45',
            'user_agent' => 'nullable|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date',
            'activo' => 'boolean',
        ]);

        $sesion = SesionUsuario::create($request->only([
            'id_usuario',
            'token',
            'ip',
            'user_agent',
            'fecha_inicio',
            'fecha_fin',
            'activo',
        ]));

        return response()->json([
            'message' => 'Sesión registrada correctamente',
            'data' => $sesion,
        ], 201);
    }

    public function show($id)
    {
        $sesion = SesionUsuario::with('usuario')->find($id);

        if (!$sesion) {
            return response()->json(['message' => 'Sesión no encontrada'], 404);
        }

        return response()->json($sesion, 200);
    }

    public function update(Request $request, $id)
    {
        $sesion = SesionUsuario::find($id);

        if (!$sesion) {
            return response()->json(['message' => 'Sesión no encontrada'], 404);
        }

        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'token' => 'nullable|string|max:255',
            'ip' => 'nullable|string|max:45',
            'user_agent' => 'nullable|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date',
            'activo' => 'boolean',
        ]);

        $sesion->update($request->only([
            'id_usuario',
            'token',
            'ip',
            'user_agent',
            'fecha_inicio',
            'fecha_fin',
            'activo',
        ]));

        return response()->json([
            'message' => 'Sesión actualizada correctamente',
            'data' => $sesion,
        ], 200);
    }

    public function destroy($id)
    {
        $sesion = SesionUsuario::find($id);

        if (!$sesion) {
            return response()->json(['message' => 'Sesión no encontrada'], 404);
        }

        $sesion->delete();

        return response()->json([
            'message' => 'Sesión eliminada correctamente',
        ], 200);
    }
}