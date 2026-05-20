<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: detalle_compras
 * Uso: Registra los productos incluidos en cada compra.
 * Relaciones:
 * - detalle_compras.id_compra   -> compras.id_compra
 * - detalle_compras.id_producto -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_compras', function (Blueprint $table) {
            $table->id('id_detalle_compra');               // PK

            $table->unsignedBigInteger('id_compra');       // FK compras
            $table->unsignedBigInteger('id_producto');     // FK productos

            $table->integer('cantidad');                   // Cantidad comprada
            $table->decimal('precio_unitario', 10, 2);     // Precio unitario de compra
            $table->decimal('subtotal', 10, 2);            // cantidad * precio_unitario

            $table->timestamps();                          // created_at / updated_at

            $table->foreign('id_compra')
                ->references('id_compra')
                ->on('compras')
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
        Schema::dropIfExists('detalle_compras');
    }
};