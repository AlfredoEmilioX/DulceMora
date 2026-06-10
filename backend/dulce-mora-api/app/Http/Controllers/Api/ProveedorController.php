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
        $proveedores = Proveedor::withCount('compras')
            ->orderBy('id_proveedor', 'desc')
            ->get();

        return response()->json($proveedores, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'razon_social' => 'required|string|max:150',
            'ruc' => 'nullable|string|max:20|unique:proveedores,ruc',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:200',
            'estado' => 'nullable|boolean',
        ]);

        $proveedor = Proveedor::create([
            'razon_social' => $request->razon_social,
            'ruc' => $request->ruc,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'direccion' => $request->direccion,
            'estado' => $request->has('estado') ? $request->estado : true,
        ]);

        $proveedor->loadCount('compras');

        return response()->json([
            'message' => 'Proveedor registrado correctamente',
            'data' => $proveedor,
        ], 201);
    }

    public function show($id)
    {
        $proveedor = Proveedor::withCount('compras')->find($id);

        if (!$proveedor) {
            return response()->json([
                'message' => 'Proveedor no encontrado',
            ], 404);
        }

        return response()->json($proveedor, 200);
    }

    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json([
                'message' => 'Proveedor no encontrado',
            ], 404);
        }

        $request->validate([
            'razon_social' => 'required|string|max:150',
            'ruc' => 'nullable|string|max:20|unique:proveedores,ruc,' . $id . ',id_proveedor',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:200',
            'estado' => 'nullable|boolean',
        ]);

        $proveedor->update([
            'razon_social' => $request->razon_social,
            'ruc' => $request->ruc,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'direccion' => $request->direccion,
            'estado' => $request->has('estado') ? $request->estado : $proveedor->estado,
        ]);

        $proveedor->loadCount('compras');

        return response()->json([
            'message' => 'Proveedor actualizado correctamente',
            'data' => $proveedor,
        ], 200);
    }

    public function destroy($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json([
                'message' => 'Proveedor no encontrado',
            ], 404);
        }

        /*
         * No se elimina físicamente porque puede tener compras asociadas.
         * Solo se desactiva.
         */
        $proveedor->update([
            'estado' => false,
        ]);

        $proveedor->loadCount('compras');

        return response()->json([
            'message' => 'Proveedor desactivado correctamente',
            'data' => $proveedor,
        ], 200);
    }

    public function cambiarEstado($id)
    {
        $proveedor = Proveedor::find($id);

        if (!$proveedor) {
            return response()->json([
                'message' => 'Proveedor no encontrado',
            ], 404);
        }

        $proveedor->update([
            'estado' => !$proveedor->estado,
        ]);

        $proveedor->loadCount('compras');

        return response()->json([
            'message' => $proveedor->estado
                ? 'Proveedor activado correctamente'
                : 'Proveedor desactivado correctamente',
            'data' => $proveedor,
        ], 200);
    }
}