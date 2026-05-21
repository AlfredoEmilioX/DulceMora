<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
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
use App\Http\Controllers\Api\PromocionController;
use App\Http\Controllers\Api\PromocionProductoController;
use App\Http\Controllers\Api\RecompensaController;
use App\Http\Controllers\Api\ComprobanteController;
use App\Http\Controllers\Api\CajaController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\Api\CompraController;
use App\Http\Controllers\Api\DetalleCompraController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\DetalleReservaController;
use App\Http\Controllers\Api\OpinionController;
use App\Http\Controllers\Api\ContactoController;
use App\Http\Controllers\Api\ConfiguracionController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\FavoritoController;
use App\Http\Controllers\Api\CuponController;
use App\Http\Controllers\Api\CuponClienteController;
use App\Http\Controllers\Api\HistorialEstadoPedidoController;
use App\Http\Controllers\Api\CarritoController;
use App\Http\Controllers\Api\AuditoriaController;
use App\Http\Controllers\Api\SesionUsuarioController;
use App\Http\Controllers\Api\RecuperacionContrasenaController;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Rutas públicas
    |--------------------------------------------------------------------------
    */

    Route::post('login', [AuthController::class, 'login']);

    Route::apiResource('categorias', CategoriaController::class)->only(['index', 'show']);
    Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);
    Route::apiResource('banners', BannerController::class)->only(['index', 'show']);
    Route::apiResource('configuraciones', ConfiguracionController::class)->only(['index', 'show']);
    Route::apiResource('contactos', ContactoController::class)->only(['store']);

    /*
    |--------------------------------------------------------------------------
    | Rutas protegidas
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);

        /*
        |--------------------------------------------------------------------------
        | Administrador
        |--------------------------------------------------------------------------
        */

        Route::middleware('rol:Administrador')->group(function () {
            Route::apiResource('roles', RolController::class);
            Route::apiResource('sedes', SedeController::class);

            Route::post('stock', [StockController::class, 'store']);
            Route::put('stock/{stock}', [StockController::class, 'update']);
            Route::patch('stock/{stock}', [StockController::class, 'update']);
            Route::delete('stock/{stock}', [StockController::class, 'destroy']);

            Route::apiResource('movimientos-stock', MovimientoStockController::class);

            Route::apiResource('proveedores', ProveedorController::class);
            Route::apiResource('compras', CompraController::class);
            Route::apiResource('detalle-compras', DetalleCompraController::class);

            Route::apiResource('cajas', CajaController::class);
            Route::apiResource('auditorias', AuditoriaController::class);
            Route::apiResource('sesiones-usuarios', SesionUsuarioController::class);

            Route::apiResource('categorias', CategoriaController::class)->except(['index', 'show']);
            Route::apiResource('productos', ProductoController::class)->except(['index', 'show']);

            Route::apiResource('promociones', PromocionController::class);
            Route::apiResource('promociones-productos', PromocionProductoController::class);

            Route::apiResource('banners', BannerController::class)->except(['index', 'show']);
            Route::apiResource('configuraciones', ConfiguracionController::class)->except(['index', 'show']);
        });

        /*
        |--------------------------------------------------------------------------
        | Administrador y Vendedor
        |--------------------------------------------------------------------------
        */

        Route::middleware('rol:Administrador,Vendedor')->group(function () {
            Route::apiResource('clientes', ClienteController::class);

            Route::post('ventas-completa', [VentaController::class, 'registrarCompleta']);
            Route::apiResource('ventas', VentaController::class);
            Route::apiResource('detalle-ventas', DetalleVentaController::class);

            Route::apiResource('pedidos', PedidoController::class);
            Route::apiResource('detalle-pedidos', DetallePedidoController::class);

            Route::apiResource('pagos', PagoController::class);
            Route::apiResource('comprobantes', ComprobanteController::class);

            Route::apiResource('deliveries', DeliveryController::class);

            Route::get('stock', [StockController::class, 'index']);
            Route::get('stock/{stock}', [StockController::class, 'show']);
        });

        /*
        |--------------------------------------------------------------------------
        | Cliente / Web
        |--------------------------------------------------------------------------
        */

        Route::middleware('rol:Administrador,Vendedor,Cliente')->group(function () {
            Route::apiResource('reservas', ReservaController::class);
            Route::apiResource('detalle-reservas', DetalleReservaController::class);

            Route::apiResource('opiniones', OpinionController::class);
            Route::apiResource('favoritos', FavoritoController::class);
            Route::apiResource('carritos', CarritoController::class);

            Route::apiResource('cupones', CuponController::class);
            Route::apiResource('cupones-clientes', CuponClienteController::class);

            Route::apiResource('recompensas', RecompensaController::class);
            Route::apiResource('notificaciones', NotificacionController::class);
            Route::apiResource('historial-estados-pedidos', HistorialEstadoPedidoController::class);
            Route::apiResource('recuperaciones-contrasenas', RecuperacionContrasenaController::class);
        });
    });
});