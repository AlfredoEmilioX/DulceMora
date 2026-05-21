<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controlador: AuthController
 * Uso: Login, logout y consulta del usuario autenticado.
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::with(['rol', 'sede'])
            ->where('email', $request->email)
            ->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        if (!$usuario->estado) {
            return response()->json([
                'message' => 'Usuario inactivo',
            ], 403);
        }

        $token = $usuario->createToken('token-api-dulce-mora')->plainTextToken;

        return response()->json([
            'message' => 'Login correcto',
            'token' => $token,
            'token_type' => 'Bearer',
            'usuario' => $usuario,
        ], 200);
    }

    public function me(Request $request)
    {
        return response()->json([
            'usuario' => $request->user()->load(['rol', 'sede']),
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ], 200);
    }
}