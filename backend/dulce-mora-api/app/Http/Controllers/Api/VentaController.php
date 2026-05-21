<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use Illuminate\Http\Request;
use App\Models\DetalleVenta;
use App\Models\Stock;
use App\Models\MovimientoStock;
use Illuminate\Support\Facades\DB;


/**
 * Controlador: VentaController
 * Uso: CRUD API para ventas.
 */
class VentaController extends Controller
{
    public function index()
    {
        $ventas = Venta::with(['cliente', 'usuario', 'sede', 'detalles.producto'])->get();

        return response()->json($ventas, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_cliente' => 'nullable|exists:clientes,id_cliente',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_venta' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metodo_pago' => 'required|string|max:30',
            'estado_venta' => 'nullable|string|max:30',
        ]);

        $venta = Venta::create($request->only([
            'id_cliente',
            'id_usuario',
            'id_sede',
            'fecha_venta',
            'subtotal',
            'descuento',
            'total',
            'metodo_pago',
            'estado_venta',
        ]));

        return response()->json([
            'message' => 'Venta registrada correctamente',
            'data' => $venta,
        ], 201);
    }

    public function show($id)
    {
        $venta = Venta::with(['cliente', 'usuario', 'sede', 'detalles.producto'])->find($id);

        if (!$venta) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        return response()->json($venta, 200);
    }

    public function update(Request $request, $id)
    {
        $venta = Venta::find($id);

        if (!$venta) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        $request->validate([
            'id_cliente' => 'nullable|exists:clientes,id_cliente',
            'id_usuario' => 'required|exists:usuarios,id_usuario',
            'id_sede' => 'required|exists:sedes,id_sede',
            'fecha_venta' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'metodo_pago' => 'required|string|max:30',
            'estado_venta' => 'nullable|string|max:30',
        ]);

        $venta->update($request->only([
            'id_cliente',
            'id_usuario',
            'id_sede',
            'fecha_venta',
            'subtotal',
            'descuento',
            'total',
            'metodo_pago',
            'estado_venta',
        ]));

        return response()->json([
            'message' => 'Venta actualizada correctamente',
            'data' => $venta,
        ], 200);
    }

    public function destroy($id)
    {
        $venta = Venta::find($id);

        if (!$venta) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        $venta->delete();

        return response()->json([
            'message' => 'Venta eliminada correctamente',
        ], 200);
    }
    /**
 * Registra una venta completa con detalles y descuenta stock automáticamente.
 */
public function registrarCompleta(Request $request)
{
    $request->validate([
        'id_cliente' => 'nullable|exists:clientes,id_cliente',
        'id_sede' => 'required|exists:sedes,id_sede',
        'metodo_pago' => 'required|string|max:30',
        'descuento' => 'nullable|numeric|min:0',
        'detalles' => 'required|array|min:1',
        'detalles.*.id_producto' => 'required|exists:productos,id_producto',
        'detalles.*.cantidad' => 'required|integer|min:1',
        'detalles.*.precio_unitario' => 'required|numeric|min:0',
    ]);

    try {
        DB::beginTransaction();

        $usuario = $request->user();
        $subtotalVenta = 0;

        foreach ($request->detalles as $item) {
            $subtotalVenta += $item['cantidad'] * $item['precio_unitario'];
        }

        $descuento = $request->descuento ?? 0;
        $total = $subtotalVenta - $descuento;

        if ($total < 0) {
            return response()->json([
                'message' => 'El total no puede ser negativo',
            ], 422);
        }

        $venta = Venta::create([
            'id_cliente' => $request->id_cliente,
            'id_usuario' => $usuario->id_usuario,
            'id_sede' => $request->id_sede,
            'fecha_venta' => now(),
            'subtotal' => $subtotalVenta,
            'descuento' => $descuento,
            'total' => $total,
            'metodo_pago' => $request->metodo_pago,
            'estado_venta' => 'completada',
        ]);

        foreach ($request->detalles as $item) {
            $stock = Stock::where('id_producto', $item['id_producto'])
                ->where('id_sede', $request->id_sede)
                ->lockForUpdate()
                ->first();

            if (!$stock) {
                DB::rollBack();

                return response()->json([
                    'message' => 'No existe stock para el producto en esta sede',
                    'id_producto' => $item['id_producto'],
                ], 422);
            }

            if ($stock->cantidad < $item['cantidad']) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Stock insuficiente',
                    'id_producto' => $item['id_producto'],
                    'stock_disponible' => $stock->cantidad,
                    'cantidad_solicitada' => $item['cantidad'],
                ], 422);
            }

            $subtotalDetalle = $item['cantidad'] * $item['precio_unitario'];

            DetalleVenta::create([
                'id_venta' => $venta->id_venta,
                'id_producto' => $item['id_producto'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $item['precio_unitario'],
                'subtotal' => $subtotalDetalle,
            ]);

            $stockAnterior = $stock->cantidad;
            $stockActual = $stockAnterior - $item['cantidad'];

            $stock->update([
                'cantidad' => $stockActual,
            ]);

            MovimientoStock::create([
                'id_stock' => $stock->id_stock,
                'id_usuario' => $usuario->id_usuario,
                'tipo_movimiento' => 'salida',
                'cantidad' => $item['cantidad'],
                'stock_anterior' => $stockAnterior,
                'stock_actual' => $stockActual,
                'motivo' => 'Venta registrada',
            ]);
        }

        DB::commit();

        return response()->json([
            'message' => 'Venta registrada correctamente y stock actualizado',
            'data' => $venta->load(['cliente', 'usuario', 'sede', 'detalles.producto']),
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Error al registrar la venta',
            'error' => $e->getMessage(),
        ], 500);
    }
}
}