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
            'dni' => 'nullable|string|size:8|unique:clientes,dni',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150|unique:clientes,email',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:200',
            'acepta_promociones' => 'boolean',
            'estado' => 'boolean',
        ]);

        $cliente = Cliente::create($request->only([
            'dni',
            'nombres',
            'apellidos',
            'telefono',
            'email',
            'fecha_nacimiento',
            'direccion',
            'acepta_promociones',
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
            return response()->json([
                'message' => 'Cliente no encontrado',
            ], 404);
        }

        return response()->json($cliente, 200);
    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json([
                'message' => 'Cliente no encontrado',
            ], 404);
        }

        $request->validate([
            'dni' => 'nullable|string|size:8|unique:clientes,dni,' . $id . ',id_cliente',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150|unique:clientes,email,' . $id . ',id_cliente',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:200',
            'acepta_promociones' => 'boolean',
            'estado' => 'boolean',
        ]);

        $cliente->update($request->only([
            'dni',
            'nombres',
            'apellidos',
            'telefono',
            'email',
            'fecha_nacimiento',
            'direccion',
            'acepta_promociones',
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
            return response()->json([
                'message' => 'Cliente no encontrado',
            ], 404);
        }

        $cliente->delete();

        return response()->json([
            'message' => 'Cliente eliminado correctamente',
        ], 200);
    }
}