<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contacto;
use Illuminate\Http\Request;

/**
 * Controlador: ContactoController
 * Uso: CRUD API para mensajes enviados desde la web pública.
 */
class ContactoController extends Controller
{
    public function index()
    {
        return response()->json(Contacto::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombres' => 'required|string|max:120',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:20',
            'asunto' => 'required|string|max:150',
            'mensaje' => 'required|string',
            'estado_contacto' => 'nullable|string|max:30',
        ]);

        $contacto = Contacto::create($request->only([
            'nombres',
            'email',
            'telefono',
            'asunto',
            'mensaje',
            'estado_contacto',
        ]));

        return response()->json([
            'message' => 'Mensaje registrado correctamente',
            'data' => $contacto,
        ], 201);
    }

    public function show($id)
    {
        $contacto = Contacto::find($id);

        if (!$contacto) {
            return response()->json(['message' => 'Mensaje no encontrado'], 404);
        }

        return response()->json($contacto, 200);
    }

    public function update(Request $request, $id)
    {
        $contacto = Contacto::find($id);

        if (!$contacto) {
            return response()->json(['message' => 'Mensaje no encontrado'], 404);
        }

        $request->validate([
            'nombres' => 'required|string|max:120',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:20',
            'asunto' => 'required|string|max:150',
            'mensaje' => 'required|string',
            'estado_contacto' => 'nullable|string|max:30',
        ]);

        $contacto->update($request->only([
            'nombres',
            'email',
            'telefono',
            'asunto',
            'mensaje',
            'estado_contacto',
        ]));

        return response()->json([
            'message' => 'Mensaje actualizado correctamente',
            'data' => $contacto,
        ], 200);
    }

    public function destroy($id)
    {
        $contacto = Contacto::find($id);

        if (!$contacto) {
            return response()->json(['message' => 'Mensaje no encontrado'], 404);
        }

        $contacto->delete();

        return response()->json([
            'message' => 'Mensaje eliminado correctamente',
        ], 200);
    }
}