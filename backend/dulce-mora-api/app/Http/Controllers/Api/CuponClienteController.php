<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CuponCliente;
use Illuminate\Http\Request;

/**
 * Controlador: CuponClienteController
 * Uso: CRUD API para cupones asignados a clientes.
 */
class CuponClienteController extends Controller
{
    public function index()
    {
        return response()->json(CuponCliente::with(['cupon', 'cliente'])->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cupon' => 'required|exists:cupones,id_cupon',
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'fecha_asignacion' => 'required|date',
            'fecha_uso' => 'nullable|date',
            'usado' => 'boolean',
        ]);

        $cuponCliente = CuponCliente::create($request->only([
            'id_cupon',
            'id_cliente',
            'fecha_asignacion',
            'fecha_uso',
            'usado',
        ]));

        return response()->json([
            'message' => 'Cupón asignado al cliente correctamente',
            'data' => $cuponCliente,
        ], 201);
    }

    public function show($id)
    {
        $cuponCliente = CuponCliente::with(['cupon', 'cliente'])->find($id);

        if (!$cuponCliente) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }

        return response()->json($cuponCliente, 200);
    }

    public function update(Request $request, $id)
    {
        $cuponCliente = CuponCliente::find($id);

        if (!$cuponCliente) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }

        $request->validate([
            'id_cupon' => 'required|exists:cupones,id_cupon',
            'id_cliente' => 'required|exists:clientes,id_cliente',
            'fecha_asignacion' => 'required|date',
            'fecha_uso' => 'nullable|date',
            'usado' => 'boolean',
        ]);

        $cuponCliente->update($request->only([
            'id_cupon',
            'id_cliente',
            'fecha_asignacion',
            'fecha_uso',
            'usado',
        ]));

        return response()->json([
            'message' => 'Cupón del cliente actualizado correctamente',
            'data' => $cuponCliente,
        ], 200);
    }

    public function destroy($id)
    {
        $cuponCliente = CuponCliente::find($id);

        if (!$cuponCliente) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }

        $cuponCliente->delete();

        return response()->json([
            'message' => 'Cupón del cliente eliminado correctamente',
        ], 200);
    }
}