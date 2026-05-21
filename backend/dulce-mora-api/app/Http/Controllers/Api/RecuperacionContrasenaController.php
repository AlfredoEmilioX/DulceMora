<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecuperacionContrasena;
use Illuminate\Http\Request;

/**
 * Controlador: RecuperacionContrasenaController
 * Uso: CRUD API para tokens de recuperación de contraseña.
 */
class RecuperacionContrasenaController extends Controller
{
    public function index()
    {
        return response()->json(
            RecuperacionContrasena::with('usuario')->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'email' => 'required|email|max:150',
            'token' => 'required|string|max:255|unique:recuperacion_contrasenas,token',
            'fecha_expiracion' => 'required|date',
            'usado' => 'boolean',
        ]);

        $recuperacion = RecuperacionContrasena::create($request->only([
            'id_usuario',
            'email',
            'token',
            'fecha_expiracion',
            'usado',
        ]));

        return response()->json([
            'message' => 'Token de recuperación registrado correctamente',
            'data' => $recuperacion,
        ], 201);
    }

    public function show($id)
    {
        $recuperacion = RecuperacionContrasena::with('usuario')->find($id);

        if (!$recuperacion) {
            return response()->json(['message' => 'Token de recuperación no encontrado'], 404);
        }

        return response()->json($recuperacion, 200);
    }

    public function update(Request $request, $id)
    {
        $recuperacion = RecuperacionContrasena::find($id);

        if (!$recuperacion) {
            return response()->json(['message' => 'Token de recuperación no encontrado'], 404);
        }

        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'email' => 'required|email|max:150',
            'token' => 'required|string|max:255|unique:recuperacion_contrasenas,token,' . $id . ',id_recuperacion',
            'fecha_expiracion' => 'required|date',
            'usado' => 'boolean',
        ]);

        $recuperacion->update($request->only([
            'id_usuario',
            'email',
            'token',
            'fecha_expiracion',
            'usado',
        ]));

        return response()->json([
            'message' => 'Token de recuperación actualizado correctamente',
            'data' => $recuperacion,
        ], 200);
    }

    public function destroy($id)
    {
        $recuperacion = RecuperacionContrasena::find($id);

        if (!$recuperacion) {
            return response()->json(['message' => 'Token de recuperación no encontrado'], 404);
        }

        $recuperacion->delete();

        return response()->json([
            'message' => 'Token de recuperación eliminado correctamente',
        ], 200);
    }
}