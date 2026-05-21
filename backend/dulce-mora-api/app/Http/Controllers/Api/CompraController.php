<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use Illuminate\Http\Request;

/**
 * Controlador: CompraController
 * Uso: CRUD API para compras a proveedores.
 */
class CompraController extends Controller
{
    public function index()
    {
        return response()->json(
            Compra::with(['proveedor', 'usuario', 'sede', 'detalles.producto'])->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_proveedor' => 'required|exists:proveedores,id_proveedor',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_compra' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'igv' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'tipo_comprobante' => 'nullable|string|max:30',
            'serie' => 'nullable|string|max:10',
            'numero' => 'nullable|string|max:20',
            'estado_compra' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $compra = Compra::create($request->only([
            'id_proveedor',
            'id_usuario',
            'id_sede',
            'fecha_compra',
            'subtotal',
            'igv',
            'total',
            'tipo_comprobante',
            'serie',
            'numero',
            'estado_compra',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Compra registrada correctamente',
            'data' => $compra,
        ], 201);
    }

    public function show($id)
    {
        $compra = Compra::with(['proveedor', 'usuario', 'sede', 'detalles.producto'])->find($id);

        if (!$compra) {
            return response()->json(['message' => 'Compra no encontrada'], 404);
        }

        return response()->json($compra, 200);
    }

    public function update(Request $request, $id)
    {
        $compra = Compra::find($id);

        if (!$compra) {
            return response()->json(['message' => 'Compra no encontrada'], 404);
        }

        $request->validate([
            'id_proveedor' => 'required|exists:proveedores,id_proveedor',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_compra' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'igv' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'tipo_comprobante' => 'nullable|string|max:30',
            'serie' => 'nullable|string|max:10',
            'numero' => 'nullable|string|max:20',
            'estado_compra' => 'nullable|string|max:30',
            'observacion' => 'nullable|string',
        ]);

        $compra->update($request->only([
            'id_proveedor',
            'id_usuario',
            'id_sede',
            'fecha_compra',
            'subtotal',
            'igv',
            'total',
            'tipo_comprobante',
            'serie',
            'numero',
            'estado_compra',
            'observacion',
        ]));

        return response()->json([
            'message' => 'Compra actualizada correctamente',
            'data' => $compra,
        ], 200);
    }

    public function destroy($id)
    {
        $compra = Compra::find($id);

        if (!$compra) {
            return response()->json(['message' => 'Compra no encontrada'], 404);
        }

        $compra->delete();

        return response()->json([
            'message' => 'Compra eliminada correctamente',
        ], 200);
    }
}