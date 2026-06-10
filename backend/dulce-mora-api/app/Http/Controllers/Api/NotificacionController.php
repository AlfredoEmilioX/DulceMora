<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

/**
 * Controlador: NotificacionController
 * Uso: Gestiona notificaciones internas del sistema.
 */
class NotificacionController extends Controller
{
    public function index()
    {
        $notificaciones = Notificacion::with('usuario')
            ->orderBy('id_notificacion', 'desc')
            ->get();

        return response()->json($notificaciones, 200);
    }

    public function resumen()
    {
        $total = Notificacion::count();
        $noLeidas = Notificacion::where('leido', false)->count();
        $leidas = Notificacion::where('leido', true)->count();
        $hoy = Notificacion::whereDate('created_at', now()->toDateString())->count();

        return response()->json([
            'total' => $total,
            'no_leidas' => $noLeidas,
            'leidas' => $leidas,
            'hoy' => $hoy,
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'titulo' => 'required|string|max:120',
            'mensaje' => 'required|string',
            'tipo' => 'nullable|string|max:30',
            'leido' => 'nullable|boolean',
        ]);

        $notificacion = Notificacion::create([
            'id_usuario' => $request->id_usuario,
            'titulo' => $request->titulo,
            'mensaje' => $request->mensaje,
            'tipo' => $request->tipo,
            'leido' => $request->leido ?? false,
        ]);

        return response()->json([
            'message' => 'Notificación registrada correctamente',
            'data' => $notificacion->load('usuario'),
        ], 201);
    }

    public function show($id)
    {
        $notificacion = Notificacion::with('usuario')->find($id);

        if (!$notificacion) {
            return response()->json([
                'message' => 'Notificación no encontrada',
            ], 404);
        }

        return response()->json($notificacion, 200);
    }

    public function update(Request $request, $id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json([
                'message' => 'Notificación no encontrada',
            ], 404);
        }

        $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'titulo' => 'required|string|max:120',
            'mensaje' => 'required|string',
            'tipo' => 'nullable|string|max:30',
            'leido' => 'nullable|boolean',
        ]);

        $notificacion->update([
            'id_usuario' => $request->id_usuario,
            'titulo' => $request->titulo,
            'mensaje' => $request->mensaje,
            'tipo' => $request->tipo,
            'leido' => $request->leido ?? false,
        ]);

        return response()->json([
            'message' => 'Notificación actualizada correctamente',
            'data' => $notificacion->load('usuario'),
        ], 200);
    }

    public function marcarLeida($id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json([
                'message' => 'Notificación no encontrada',
            ], 404);
        }

        $notificacion->update([
            'leido' => true,
        ]);

        return response()->json([
            'message' => 'Notificación marcada como leída',
            'data' => $notificacion,
        ], 200);
    }

    public function marcarNoLeida($id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json([
                'message' => 'Notificación no encontrada',
            ], 404);
        }

        $notificacion->update([
            'leido' => false,
        ]);

        return response()->json([
            'message' => 'Notificación marcada como no leída',
            'data' => $notificacion,
        ], 200);
    }

    public function destroy($id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json([
                'message' => 'Notificación no encontrada',
            ], 404);
        }

        $notificacion->delete();

        return response()->json([
            'message' => 'Notificación eliminada correctamente',
        ], 200);
    }
}