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
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\UsuarioController;

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTENTICACIÓN
    |--------------------------------------------------------------------------
    */

    Route::post('login', [AuthController::class, 'login']);

    /*
    |--------------------------------------------------------------------------
    | RUTAS PÚBLICAS
    |--------------------------------------------------------------------------
    */

    Route::get('configuracion/principal', [
        ConfiguracionController::class,
        'principal',
    ]);

    Route::apiResource('categorias', CategoriaController::class)->only([
        'index',
        'show',
    ]);

    Route::apiResource('productos', ProductoController::class)->only([
        'index',
        'show',
    ]);

    Route::apiResource('banners', BannerController::class)->only([
        'index',
        'show',
    ]);

    Route::apiResource('configuraciones', ConfiguracionController::class)->only([
        'index',
        'show',
    ]);

    Route::apiResource('sedes', SedeController::class)->only([
        'index',
        'show',
    ]);

    Route::apiResource('promociones', PromocionController::class)->only([
        'index',
        'show',
    ]);

    Route::apiResource('promociones-productos', PromocionProductoController::class)->only([
        'index',
        'show',
    ]);

    Route::apiResource('contactos', ContactoController::class)->only([
        'store',
    ]);

    /*
    |--------------------------------------------------------------------------
    | RUTAS PROTEGIDAS
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);

        /*
        |--------------------------------------------------------------------------
        | REPORTES
        |--------------------------------------------------------------------------
        */

        Route::middleware('rol:Administrador')->prefix('reportes')->group(function () {
            Route::get('resumen', [ReporteController::class, 'resumen']);
            Route::get('ventas-por-sede', [ReporteController::class, 'ventasPorSede']);
            Route::get('productos-mas-vendidos', [ReporteController::class, 'productosMasVendidos']);
            Route::get('stock-bajo', [ReporteController::class, 'stockBajo']);

            Route::get('cumpleanos-hoy', [ReporteController::class, 'cumpleanosHoy']);
            Route::get('cumpleanos-mes', [ReporteController::class, 'cumpleanosMes']);

            Route::get('pagos-por-metodo', [ReporteController::class, 'pagosPorMetodo']);
            Route::get('ventas-recientes', [ReporteController::class, 'ventasRecientes']);
            Route::get('ventas/{id}/detalle', [ReporteController::class, 'detalleVenta']);
        });

        /*
        |--------------------------------------------------------------------------
        | ADMINISTRADOR
        |--------------------------------------------------------------------------
        */

        Route::middleware('rol:Administrador')->group(function () {

            Route::apiResource('roles', RolController::class);

            Route::apiResource('usuarios', UsuarioController::class);

            Route::patch('usuarios/{id}/cambiar-estado', [
                UsuarioController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('categorias', CategoriaController::class)->except([
                'index',
                'show',
            ]);

            Route::patch('categorias/{id}/cambiar-estado', [
                CategoriaController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('productos', ProductoController::class)->except([
                'index',
                'show',
            ]);

            Route::patch('productos/{id}/cambiar-estado', [
                ProductoController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('banners', BannerController::class)->except([
                'index',
                'show',
            ]);

            Route::put('configuracion/principal', [
                ConfiguracionController::class,
                'guardarPrincipal',
            ]);

            Route::apiResource('configuraciones', ConfiguracionController::class)->except([
                'index',
                'show',
            ]);

            Route::apiResource('sedes', SedeController::class)->except([
                'index',
                'show',
            ]);

            Route::patch('sedes/{id}/cambiar-estado', [
                SedeController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('promociones', PromocionController::class)->except([
                'index',
                'show',
            ]);

            Route::patch('promociones/{id}/cambiar-estado', [
                PromocionController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('promociones-productos', PromocionProductoController::class)->except([
                'index',
                'show',
            ]);

            Route::apiResource('proveedores', ProveedorController::class);

            Route::patch('proveedores/{id}/cambiar-estado', [
                ProveedorController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('compras', CompraController::class);

            Route::apiResource('detalle-compras', DetalleCompraController::class)->only([
                'index',
                'show',
            ]);

            Route::apiResource('cupones', CuponController::class);
            Route::apiResource('cupones-clientes', CuponClienteController::class);
            Route::apiResource('recompensas', RecompensaController::class);

            Route::get('notificaciones/resumen', [
                NotificacionController::class,
                'resumen',
            ]);

            Route::patch('notificaciones/{id}/marcar-leida', [
                NotificacionController::class,
                'marcarLeida',
            ]);

            Route::patch('notificaciones/{id}/marcar-no-leida', [
                NotificacionController::class,
                'marcarNoLeida',
            ]);

            Route::apiResource('notificaciones', NotificacionController::class);

            Route::apiResource('auditorias', AuditoriaController::class);
            Route::apiResource('sesiones-usuarios', SesionUsuarioController::class);
        });

        /*
        |--------------------------------------------------------------------------
        | ADMINISTRADOR Y VENDEDOR
        |--------------------------------------------------------------------------
        */

        Route::middleware('rol:Administrador,Vendedor')->group(function () {

            Route::apiResource('clientes', ClienteController::class);

            Route::apiResource('ventas', VentaController::class);
            Route::apiResource('detalle-ventas', DetalleVentaController::class);

            Route::post('ventas-completa', [
                VentaController::class,
                'registrarCompleta',
            ]);

            Route::apiResource('stock', StockController::class);

            Route::patch('stock/{id}/cambiar-estado', [
                StockController::class,
                'cambiarEstado',
            ]);

            Route::get('stock-bajo', [
                StockController::class,
                'stockBajo',
            ]);

            Route::apiResource('movimientos-stock', MovimientoStockController::class)->only([
                'index',
                'store',
                'show',
            ]);

            Route::get('cajas/resumen', [
                CajaController::class,
                'resumen',
            ]);

            Route::put('cajas/{id}/cerrar', [
                CajaController::class,
                'cerrar',
            ]);

            Route::apiResource('cajas', CajaController::class);

            Route::apiResource('pagos', PagoController::class);

            Route::apiResource('comprobantes', ComprobanteController::class);

            Route::post('comprobantes/generar-desde-venta', [
                ComprobanteController::class,
                'generarDesdeVenta',
            ]);

            Route::apiResource('pedidos', PedidoController::class);

            Route::patch('pedidos/{id}/cambiar-estado', [
                PedidoController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('detalle-pedidos', DetallePedidoController::class)->only([
                'index',
                'show',
            ]);

            Route::apiResource('deliverys', DeliveryController::class)->only([
                'index',
                'show',
                'update',
            ]);

            Route::apiResource('reservas', ReservaController::class);

            Route::patch('reservas/{id}/cambiar-estado', [
                ReservaController::class,
                'cambiarEstado',
            ]);

            Route::apiResource('detalle-reservas', DetalleReservaController::class)->only([
                'index',
                'show',
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | CLIENTE / WEB AUTENTICADO
        |--------------------------------------------------------------------------
        */

        Route::middleware('rol:Administrador,Vendedor,Cliente')->group(function () {

            Route::apiResource('opiniones', OpinionController::class);
            Route::apiResource('favoritos', FavoritoController::class);
            Route::apiResource('carritos', CarritoController::class);

            Route::apiResource('historial-estados-pedidos', HistorialEstadoPedidoController::class);

            Route::apiResource('recuperaciones-contrasenas', RecuperacionContrasenaController::class);
        });
    });
});