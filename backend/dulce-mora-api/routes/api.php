<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\SedeController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\VentaController;
use App\Http\Controllers\Api\DetalleVentaController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\DetallePedidoController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\MovimientoStockController;

Route::prefix('v1')->group(function () {
    Route::apiResource('roles', RolController::class);
    Route::apiResource('sedes', SedeController::class);
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('productos', ProductoController::class);
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('ventas', VentaController::class);
    Route::apiResource('detalle-ventas', DetalleVentaController::class);
    Route::apiResource('pedidos', PedidoController::class);
    Route::apiResource('detalle-pedidos', DetallePedidoController::class);
    Route::apiResource('stock', StockController::class);
    Route::apiResource('movimientos-stock', MovimientoStockController::class);
});