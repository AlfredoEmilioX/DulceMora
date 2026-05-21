<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comprobante;
use Illuminate\Http\Request;

/**
 * Controlador: ComprobanteController
 * Uso: CRUD API para comprobantes de venta.
 */
class ComprobanteController extends Controller
{
    public function index()
    {
        return response()->json(Comprobante::with('venta')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_venta' => 'required|exists:ventas,id_venta',
            'tipo_comprobante' => 'required|string|max:30',
            'serie' => 'required|string|max:10',
            'numero' => 'required|string|max:20',
            'fecha_emision' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'igv' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'estado_comprobante' => 'nullable|string|max:30',
        ]);

        $comprobante = Comprobante::create($request->only([
            'id_venta',
            'tipo_comprobante',
            'serie',
            'numero',
            'fecha_emision',
            'subtotal',
            'igv',
            'total',
            'estado_comprobante',
        ]));

        return response()->json([
            'message' => 'Comprobante registrado correctamente',
            'data' => $comprobante,
        ], 201);
    }

    public function show($id)
    {
        $comprobante = Comprobante::with('venta')->find($id);

        if (!$comprobante) {
            return response()->json(['message' => 'Comprobante no encontrado'], 404);
        }

        return response()->json($comprobante, 200);
    }

    public function update(Request $request, $id)
    {
        $comprobante = Comprobante::find($id);

        if (!$comprobante) {
            return response()->json(['message' => 'Comprobante no encontrado'], 404);
        }

        $request->validate([
            'id_venta' => 'required|exists:ventas,id_venta',
            'tipo_comprobante' => 'required|string|max:30',
            'serie' => 'required|string|max:10',
            'numero' => 'required|string|max:20',
            'fecha_emision' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'igv' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'estado_comprobante' => 'nullable|string|max:30',
        ]);

        $comprobante->update($request->only([
            'id_venta',
            'tipo_comprobante',
            'serie',
            'numero',
            'fecha_emision',
            'subtotal',
            'igv',
            'total',
            'estado_comprobante',
        ]));

        return response()->json([
            'message' => 'Comprobante actualizado correctamente',
            'data' => $comprobante,
        ], 200);
    }

    public function destroy($id)
    {
        $comprobante = Comprobante::find($id);

        if (!$comprobante) {
            return response()->json(['message' => 'Comprobante no encontrado'], 404);
        }

        $comprobante->delete();

        return response()->json([
            'message' => 'Comprobante eliminado correctamente',
        ], 200);
    }
}