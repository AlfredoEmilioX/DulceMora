<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: movimientos_stock
 * Uso: Registra entradas, salidas y ajustes del inventario.
 * Relaciones:
 * - movimientos_stock.id_stock   -> stock.id_stock
 * - movimientos_stock.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_stock', function (Blueprint $table) {
            $table->id('id_movimiento_stock');              // PK

            $table->unsignedBigInteger('id_stock');         // FK stock
            $table->unsignedBigInteger('id_usuario');       // FK usuarios

            $table->string('tipo_movimiento', 30);          // entrada, salida, ajuste
            $table->integer('cantidad');                    // Cantidad movida
            $table->integer('stock_anterior');              // Stock antes del movimiento
            $table->integer('stock_actual');                // Stock después del movimiento
            $table->string('motivo', 150)->nullable();      // Motivo del movimiento
            $table->timestamps();                           // created_at / updated_at

            $table->foreign('id_stock')
                ->references('id_stock')
                ->on('stock')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_stock');
    }
};