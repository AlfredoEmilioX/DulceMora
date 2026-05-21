<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware: VerificarRol
 * Uso: Restringe rutas según el rol del usuario autenticado.
 */
class VerificarRol
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no autenticado',
            ], 401);
        }

        $usuario->load('rol');

        if (!$usuario->rol) {
            return response()->json([
                'message' => 'El usuario no tiene un rol asignado',
            ], 403);
        }

        $nombreRol = strtolower($usuario->rol->nombre_rol);

        $rolesPermitidos = array_map('strtolower', $roles);

        if (!in_array($nombreRol, $rolesPermitidos)) {
            return response()->json([
                'message' => 'No tiene permisos para acceder a este recurso',
            ], 403);
        }

        return $next($request);
    }
}