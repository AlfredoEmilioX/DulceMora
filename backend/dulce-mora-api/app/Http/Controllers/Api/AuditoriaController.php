<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use Illuminate\Http\Request;

/**
 * Controlador: AuditoriaController
 * Uso: CRUD API para auditoría de acciones del sistema.
 */
class AuditoriaController extends Controller
{
    public function index()
    {
        return response()->json(Auditoria::with('usuario')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'tabla_afectada' => 'required|string|max:100',
            'id_registro' => 'nullable|integer|min:1',
            'accion' => 'required|string|max:30',
            'descripcion' => 'nullable|string',
            'ip' => 'nullable|string|max:45',
            'user_agent' => 'nullable|string|max:255',
        ]);

        $auditoria = Auditoria::create($request->only([
            'id_usuario',
            'tabla_afectada',
            'id_registro',
            'accion',
            'descripcion',
            'ip',
            'user_agent',
        ]));

        return response()->json([
            'message' => 'Auditoría registrada correctamente',
            'data' => $auditoria,
        ], 201);
    }

    public function show($id)
    {
        $auditoria = Auditoria::with('usuario')->find($id);

        if (!$auditoria) {
            return response()->json(['message' => 'Auditoría no encontrada'], 404);
        }

        return response()->json($auditoria, 200);
    }

    public function update(Request $request, $id)
    {
        $auditoria = Auditoria::find($id);

        if (!$auditoria) {
            return response()->json(['message' => 'Auditoría no encontrada'], 404);
        }

        $request->validate([
            'id_usuario' => 'nullable|exists:usuarios,id_usuario',
            'tabla_afectada' => 'required|string|max:100',
            'id_registro' => 'nullable|integer|min:1',
            'accion' => 'required|string|max:30',
            'descripcion' => 'nullable|string',
            'ip' => 'nullable|string|max:45',
            'user_agent' => 'nullable|string|max:255',
        ]);

        $auditoria->update($request->only([
            'id_usuario',
            'tabla_afectada',
            'id_registro',
            'accion',
            'descripcion',
            'ip',
            'user_agent',
        ]));

        return response()->json([
            'message' => 'Auditoría actualizada correctamente',
            'data' => $auditoria,
        ], 200);
    }

    public function destroy($id)
    {
        $auditoria = Auditoria::find($id);

        if (!$auditoria) {
            return response()->json(['message' => 'Auditoría no encontrada'], 404);
        }

        $auditoria->delete();

        return response()->json([
            'message' => 'Auditoría eliminada correctamente',
        ], 200);
    }
}