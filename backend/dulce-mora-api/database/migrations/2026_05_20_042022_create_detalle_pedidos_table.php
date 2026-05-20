<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: detalle_pedidos
 * Uso: Registra los productos incluidos en cada pedido.
 * Relaciones:
 * - detalle_pedidos.id_pedido   -> pedidos.id_pedido
 * - detalle_pedidos.id_producto -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_pedidos', function (Blueprint $table) {
            $table->id('id_detalle_pedido');                // PK

            $table->unsignedBigInteger('id_pedido');        // FK pedidos
            $table->unsignedBigInteger('id_producto');      // FK productos

            $table->integer('cantidad');                    // Cantidad solicitada
            $table->decimal('precio_unitario', 10, 2);      // Precio al momento del pedido
            $table->decimal('subtotal', 10, 2);             // cantidad * precio_unitario

            $table->timestamps();                           // created_at / updated_at

            $table->foreign('id_pedido')
                ->references('id_pedido')
                ->on('pedidos')
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
        Schema::dropIfExists('detalle_pedidos');
    }
};