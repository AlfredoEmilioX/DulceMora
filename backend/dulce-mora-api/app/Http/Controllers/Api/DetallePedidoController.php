<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetallePedido;

/**
 * Controlador: DetallePedidoController
 * Uso: Consulta detalles de pedidos.
 */
class DetallePedidoController extends Controller
{
    public function index()
    {
        $detalles = DetallePedido::with([
            'pedido.cliente',
            'pedido.sede',
            'producto.categoria',
        ])
            ->orderBy('id_detalle_pedido', 'desc')
            ->get();

        return response()->json($detalles, 200);
    }

    public function show($id)
    {
        $detalle = DetallePedido::with([
            'pedido.cliente',
            'pedido.sede',
            'producto.categoria',
        ])->find($id);

        if (!$detalle) {
            return response()->json([
                'message' => 'Detalle de pedido no encontrado',
            ], 404);
        }

        return response()->json($detalle, 200);
    }

    public function store()
    {
        return response()->json([
            'message' => 'Los detalles se registran desde el módulo de pedidos.',
        ], 405);
    }

    public function update()
    {
        return response()->json([
            'message' => 'Los detalles de pedido no se editan directamente.',
        ], 405);
    }

    public function destroy()
    {
        return response()->json([
            'message' => 'Los detalles de pedido no se eliminan directamente.',
        ], 405);
    }
}