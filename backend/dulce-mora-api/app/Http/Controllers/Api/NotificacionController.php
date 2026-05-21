<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

/**
 * Controlador: NotificacionController
 * Uso: CRUD API para notificaciones internas.
 */
class NotificacionController extends Controller
{
    public function index()
    {
        return response()->json(Notificacion::with('usuario')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'titulo' => 'required|string|max:120',
            'mensaje' => 'required|string',
            'tipo' => 'nullable|string|max:30',
            'leido' => 'boolean',
        ]);

        $notificacion = Notificacion::create($request->only([
            'id_usuario',
            'titulo',
            'mensaje',
            'tipo',
            'leido',
        ]));

        return response()->json([
            'message' => 'Notificación registrada correctamente',
            'data' => $notificacion,
        ], 201);
    }

    public function show($id)
    {
        $notificacion = Notificacion::with('usuario')->find($id);

        if (!$notificacion) {
            return response()->json(['message' => 'Notificación no encontrada'], 404);
        }

        return response()->json($notificacion, 200);
    }

    public function update(Request $request, $id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json(['message' => 'Notificación no encontrada'], 404);
        }

        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'titulo' => 'required|string|max:120',
            'mensaje' => 'required|string',
            'tipo' => 'nullable|string|max:30',
            'leido' => 'boolean',
        ]);

        $notificacion->update($request->only([
            'id_usuario',
            'titulo',
            'mensaje',
            'tipo',
            'leido',
        ]));

        return response()->json([
            'message' => 'Notificación actualizada correctamente',
            'data' => $notificacion,
        ], 200);
    }

    public function destroy($id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json(['message' => 'Notificación no encontrada'], 404);
        }

        $notificacion->delete();

        return response()->json([
            'message' => 'Notificación eliminada correctamente',
        ], 200);
    }
}