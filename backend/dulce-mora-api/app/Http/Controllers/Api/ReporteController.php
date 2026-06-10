<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    /**
     * Resumen general del sistema.
     */
    public function resumen()
    {
        $totalVentas = DB::table('ventas')->count();

        $ingresosTotales = DB::table('ventas')
            ->where('estado_venta', 'completada')
            ->sum('total');

        $totalClientes = DB::table('clientes')->count();
        $totalProductos = DB::table('productos')->count();
        $totalSedes = DB::table('sedes')->count();

        $productosStockBajo = DB::table('stock')
            ->whereColumn('cantidad', '<=', 'stock_minimo')
            ->count();

        return response()->json([
            'total_ventas' => $totalVentas,
            'ingresos_totales' => $ingresosTotales,
            'total_clientes' => $totalClientes,
            'total_productos' => $totalProductos,
            'total_sedes' => $totalSedes,
            'productos_stock_bajo' => $productosStockBajo,
        ], 200);
    }

    /**
     * Reporte de ventas por sede.
     */
    public function ventasPorSede()
    {
        $datos = DB::table('ventas')
            ->join('sedes', 'ventas.id_sede', '=', 'sedes.id_sede')
            ->select(
                'sedes.id_sede',
                'sedes.nombre_comercial as sede',
                DB::raw('COUNT(ventas.id_venta) as total_ventas'),
                DB::raw('SUM(ventas.total) as ingresos_totales')
            )
            ->where('ventas.estado_venta', 'completada')
            ->groupBy('sedes.id_sede', 'sedes.nombre_comercial')
            ->orderByDesc('ingresos_totales')
            ->get();

        return response()->json($datos, 200);
    }

    /**
     * Reporte de productos más vendidos.
     */
    public function productosMasVendidos()
    {
        $datos = DB::table('detalle_ventas')
            ->join('productos', 'detalle_ventas.id_producto', '=', 'productos.id_producto')
            ->select(
                'productos.id_producto',
                'productos.nombre_producto',
                DB::raw('SUM(detalle_ventas.cantidad) as total_vendido'),
                DB::raw('SUM(detalle_ventas.subtotal) as total_generado')
            )
            ->groupBy('productos.id_producto', 'productos.nombre_producto')
            ->orderByDesc('total_vendido')
            ->limit(10)
            ->get();

        return response()->json($datos, 200);
    }

    /**
     * Reporte de productos con stock bajo.
     */
    public function stockBajo()
    {
        $datos = DB::table('stock')
            ->join('productos', 'stock.id_producto', '=', 'productos.id_producto')
            ->join('sedes', 'stock.id_sede', '=', 'sedes.id_sede')
            ->select(
                'stock.id_stock',
                'productos.id_producto',
                'productos.nombre_producto',
                'sedes.id_sede',
                'sedes.nombre_comercial as sede',
                'stock.cantidad',
                'stock.stock_minimo',
                'stock.estado'
            )
            ->whereColumn('stock.cantidad', '<=', 'stock.stock_minimo')
            ->orderBy('stock.cantidad', 'asc')
            ->get();

        return response()->json($datos, 200);
    }

    /**
     * Clientes que cumplen años hoy.
     */
    public function cumpleanosHoy()
    {
        $mesActual = now()->month;
        $diaActual = now()->day;

        $datos = DB::table('clientes')
            ->whereMonth('fecha_nacimiento', $mesActual)
            ->whereDay('fecha_nacimiento', $diaActual)
            ->where('acepta_promociones', true)
            ->where('estado', true)
            ->select(
                'id_cliente',
                'dni',
                'nombres',
                'apellidos',
                'telefono',
                'email',
                'fecha_nacimiento',
                'fecha_ultimo_saludo_cumpleanos',
                DB::raw('TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad')
            )
            ->orderBy('nombres', 'asc')
            ->get();

        return response()->json($datos, 200);
    }

    /**
     * Clientes que cumplen años este mes.
     */
    public function cumpleanosMes()
    {
        $mesActual = now()->month;

        $datos = DB::table('clientes')
            ->whereMonth('fecha_nacimiento', $mesActual)
            ->where('acepta_promociones', true)
            ->where('estado', true)
            ->select(
                'id_cliente',
                'dni',
                'nombres',
                'apellidos',
                'telefono',
                'email',
                'fecha_nacimiento',
                'fecha_ultimo_saludo_cumpleanos',
                DB::raw('TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) as edad')
            )
            ->orderByRaw('DAY(fecha_nacimiento) ASC')
            ->get();

        return response()->json($datos, 200);
    }

    /**
     * Reporte de pagos agrupados por método de pago.
     */
    public function pagosPorMetodo()
    {
        $datos = DB::table('pagos')
            ->select(
                'metodo_pago',
                DB::raw('COUNT(id_pago) as total_pagos'),
                DB::raw('SUM(monto) as total_recaudado')
            )
            ->groupBy('metodo_pago')
            ->orderByDesc('total_recaudado')
            ->get();

        return response()->json($datos, 200);
    }

    /**
     * Reporte de ventas recientes.
     */
    public function ventasRecientes()
    {
        $datos = DB::table('ventas')
            ->leftJoin('clientes', 'ventas.id_cliente', '=', 'clientes.id_cliente')
            ->join('sedes', 'ventas.id_sede', '=', 'sedes.id_sede')
            ->join('usuarios', 'ventas.id_usuario', '=', 'usuarios.id_usuario')
            ->select(
                'ventas.id_venta',
                'ventas.fecha_venta',
                'ventas.subtotal',
                'ventas.descuento',
                'ventas.total',
                'ventas.metodo_pago',
                'ventas.estado_venta',
                DB::raw("
                    CASE 
                        WHEN clientes.id_cliente IS NULL 
                        THEN 'Sin cliente'
                        ELSE CONCAT(clientes.nombres, ' ', clientes.apellidos)
                    END as cliente
                "),
                DB::raw("CONCAT(usuarios.nombres, ' ', usuarios.apellidos) as vendedor"),
                'sedes.nombre_comercial as sede'
            )
            ->orderByDesc('ventas.fecha_venta')
            ->limit(10)
            ->get();

        return response()->json($datos, 200);
    }

    /**
     * Detalle completo de una venta.
     */
    public function detalleVenta($id)
{
    $venta = DB::table('ventas')
        ->leftJoin('clientes', 'ventas.id_cliente', '=', 'clientes.id_cliente')
        ->join('usuarios', 'ventas.id_usuario', '=', 'usuarios.id_usuario')
        ->join('sedes', 'ventas.id_sede', '=', 'sedes.id_sede')
        ->where('ventas.id_venta', $id)
        ->select(
            'ventas.id_venta',
            'ventas.fecha_venta',
            'ventas.subtotal',
            'ventas.descuento',
            'ventas.total',
            'ventas.metodo_pago',
            'ventas.estado_venta',

            'clientes.id_cliente',
            'clientes.dni as cliente_dni',
            'clientes.nombres as cliente_nombres',
            'clientes.apellidos as cliente_apellidos',
            'clientes.telefono as cliente_telefono',
            'clientes.email as cliente_email',
            'clientes.direccion as cliente_direccion',

            'usuarios.id_usuario',
            'usuarios.nombres as vendedor_nombres',
            'usuarios.apellidos as vendedor_apellidos',

            'sedes.id_sede',
            'sedes.nombre_comercial as sede_nombre',
            'sedes.direccion as sede_direccion'
        )
        ->first();

    if (!$venta) {
        return response()->json([
            'message' => 'Venta no encontrada',
        ], 404);
    }

    $detalles = DB::table('detalle_ventas')
        ->join('productos', 'detalle_ventas.id_producto', '=', 'productos.id_producto')
        ->where('detalle_ventas.id_venta', $id)
        ->select(
            'detalle_ventas.id_detalle_venta',
            'detalle_ventas.id_producto',
            'productos.nombre_producto',
            'productos.descripcion',
            'detalle_ventas.cantidad',
            'detalle_ventas.precio_unitario',
            'detalle_ventas.subtotal'
        )
        ->get();

    $comprobantes = DB::table('comprobantes')
        ->where('id_venta', $id)
        ->select(
            'id_comprobante',
            'tipo_comprobante',
            'serie',
            'numero',
            'fecha_emision',
            'tipo_documento_cliente',
            'numero_documento_cliente',
            'nombre_cliente',
            'direccion_cliente',
            'subtotal',
            'igv',
            'total',
            'estado_comprobante'
        )
        ->orderByDesc('fecha_emision')
        ->get();

    return response()->json([
        'venta' => $venta,
        'detalles' => $detalles,
        'comprobantes' => $comprobantes,
    ], 200);
}
}