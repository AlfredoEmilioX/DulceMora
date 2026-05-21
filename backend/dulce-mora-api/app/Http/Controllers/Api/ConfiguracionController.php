<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\Request;

/**
 * Controlador: ConfiguracionController
 * Uso: CRUD API para datos generales del negocio.
 */
class ConfiguracionController extends Controller
{
    public function index()
    {
        return response()->json(Configuracion::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_negocio' => 'required|string|max:120',
            'logo' => 'nullable|string|max:255',
            'color_primario' => 'nullable|string|max:20',
            'color_secundario' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:200',
            'facebook' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ]);

        $configuracion = Configuracion::create($request->only([
            'nombre_negocio',
            'logo',
            'color_primario',
            'color_secundario',
            'telefono',
            'whatsapp',
            'email',
            'direccion',
            'facebook',
            'instagram',
            'tiktok',
            'estado',
        ]));

        return response()->json([
            'message' => 'Configuración registrada correctamente',
            'data' => $configuracion,
        ], 201);
    }

    public function show($id)
    {
        $configuracion = Configuracion::find($id);

        if (!$configuracion) {
            return response()->json(['message' => 'Configuración no encontrada'], 404);
        }

        return response()->json($configuracion, 200);
    }

    public function update(Request $request, $id)
    {
        $configuracion = Configuracion::find($id);

        if (!$configuracion) {
            return response()->json(['message' => 'Configuración no encontrada'], 404);
        }

        $request->validate([
            'nombre_negocio' => 'required|string|max:120',
            'logo' => 'nullable|string|max:255',
            'color_primario' => 'nullable|string|max:20',
            'color_secundario' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:200',
            'facebook' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ]);

        $configuracion->update($request->only([
            'nombre_negocio',
            'logo',
            'color_primario',
            'color_secundario',
            'telefono',
            'whatsapp',
            'email',
            'direccion',
            'facebook',
            'instagram',
            'tiktok',
            'estado',
        ]));

        return response()->json([
            'message' => 'Configuración actualizada correctamente',
            'data' => $configuracion,
        ], 200);
    }

    public function destroy($id)
    {
        $configuracion = Configuracion::find($id);

        if (!$configuracion) {
            return response()->json(['message' => 'Configuración no encontrada'], 404);
        }

        $configuracion->delete();

        return response()->json([
            'message' => 'Configuración eliminada correctamente',
        ], 200);
    }
}