<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

/**
 * Controlador: ClienteController
 * Uso: CRUD API para clientes del sistema.
 */
class ClienteController extends Controller
{
    public function index()
    {
        return response()->json(Cliente::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombres' => 'required|string|max:100',
            'apellidos' => 'nullable|string|max:100',
            'documento' => 'nullable|string|max:20|unique:clientes,documento',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150|unique:clientes,email',
            'direccion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $cliente = Cliente::create($request->only([
            'nombres',
            'apellidos',
            'documento',
            'telefono',
            'email',
            'direccion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Cliente registrado correctamente',
            'data' => $cliente,
        ], 201);
    }

    public function show($id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        return response()->json($cliente, 200);
    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        $request->validate([
            'nombres' => 'required|string|max:100',
            'apellidos' => 'nullable|string|max:100',
            'documento' => 'nullable|string|max:20|unique:clientes,documento,' . $id . ',id_cliente',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150|unique:clientes,email,' . $id . ',id_cliente',
            'direccion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $cliente->update($request->only([
            'nombres',
            'apellidos',
            'documento',
            'telefono',
            'email',
            'direccion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Cliente actualizado correctamente',
            'data' => $cliente,
        ], 200);
    }

    public function destroy($id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        $cliente->delete();

        return response()->json([
            'message' => 'Cliente eliminado correctamente',
        ], 200);
    }
}