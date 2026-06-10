<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetalleCompra;

/**
 * Controlador: DetalleCompraController
 * Uso: Consulta detalles de compras.
 */
class DetalleCompraController extends Controller
{
    public function index()
    {
        $detalles = DetalleCompra::with([
            'compra.proveedor',
            'compra.sede',
            'producto.categoria',
        ])
            ->orderBy('id_detalle_compra', 'desc')
            ->get();

        return response()->json($detalles, 200);
    }

    public function show($id)
    {
        $detalle = DetalleCompra::with([
            'compra.proveedor',
            'compra.sede',
            'producto.categoria',
        ])->find($id);

        if (!$detalle) {
            return response()->json([
                'message' => 'Detalle de compra no encontrado',
            ], 404);
        }

        return response()->json($detalle, 200);
    }

    public function store()
    {
        return response()->json([
            'message' => 'Los detalles se registran desde el módulo de compras.',
        ], 405);
    }

    public function update()
    {
        return response()->json([
            'message' => 'Los detalles de compra no se editan directamente.',
        ], 405);
    }

    public function destroy()
    {
        return response()->json([
            'message' => 'Los detalles de compra no se eliminan directamente.',
        ], 405);
    }
}