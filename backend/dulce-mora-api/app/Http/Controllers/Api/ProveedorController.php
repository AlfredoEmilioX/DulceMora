<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;

/**
 * Controlador: ProveedorController
 * Uso: CRUD API para proveedores.
 */
class ProveedorController extends Controller
{
    public function index()
    {
        return response()->json(Proveedor::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'razon_social' => 'required|string|max:150',
            'ruc' => 'nullable|string|max:20|unique:proveedores,ruc',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $proveedor = Proveedor::create($request->only([
            'razon_social',
            'ruc',
            'telefono',
            'email',
            'direccion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Proveedor registrado correctamente',
            'data' => $proveedor,
        ], 201);
    }

    public function show($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json(['message' => 'Proveedor no encontrado'], 404);
        }

        return response()->json($proveedor, 200);
    }

    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json(['message' => 'Proveedor no encontrado'], 404);
        }

        $request->validate([
            'razon_social' => 'required|string|max:150',
            'ruc' => 'nullable|string|max:20|unique:proveedores,ruc,' . $id . ',id_proveedor',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:200',
            'estado' => 'boolean',
        ]);

        $proveedor->update($request->only([
            'razon_social',
            'ruc',
            'telefono',
            'email',
            'direccion',
            'estado',
        ]));

        return response()->json([
            'message' => 'Proveedor actualizado correctamente',
            'data' => $proveedor,
        ], 200);
    }

    public function destroy($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json(['message' => 'Proveedor no encontrado'], 404);
        }

        $proveedor->delete();

        return response()->json([
            'message' => 'Proveedor eliminado correctamente',
        ], 200);
    }
}