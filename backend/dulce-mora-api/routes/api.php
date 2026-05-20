<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\SedeController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ClienteController;

Route::prefix('v1')->group(function () {
    Route::apiResource('roles', RolController::class);
    Route::apiResource('sedes', SedeController::class);
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('productos', ProductoController::class);
    Route::apiResource('clientes', ClienteController::class);
});