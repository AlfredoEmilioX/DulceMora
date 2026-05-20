<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: detalle_ventas
 * Uso: Registra los productos vendidos dentro de cada venta.
 * Relaciones:
 * - detalle_ventas.id_venta    -> ventas.id_venta
 * - detalle_ventas.id_producto -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_ventas', function (Blueprint $table) {
            $table->id('id_detalle_venta');                  // PK

            $table->unsignedBigInteger('id_venta');          // FK ventas
            $table->unsignedBigInteger('id_producto');       // FK productos

            $table->integer('cantidad');                     // Cantidad vendida
            $table->decimal('precio_unitario', 10, 2);       // Precio al momento de venta
            $table->decimal('subtotal', 10, 2);              // cantidad * precio_unitario

            $table->timestamps();                            // created_at / updated_at

            $table->foreign('id_venta')
                ->references('id_venta')
                ->on('ventas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('id_producto')
                ->references('id_producto')
                ->on('productos')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ventas');
    }
};