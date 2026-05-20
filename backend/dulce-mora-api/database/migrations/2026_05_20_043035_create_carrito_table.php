<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: carrito
 * Uso: Guarda productos agregados al carrito por cada cliente.
 * Relaciones:
 * - carrito.id_cliente  -> clientes.id_cliente
 * - carrito.id_producto -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carrito', function (Blueprint $table) {
            $table->id('id_carrito');                     // PK

            $table->unsignedBigInteger('id_cliente');     // FK clientes
            $table->unsignedBigInteger('id_producto');    // FK productos

            $table->integer('cantidad')->default(1);      // Cantidad agregada
            $table->decimal('precio_unitario', 10, 2);    // Precio actual del producto
            $table->decimal('subtotal', 10, 2);           // cantidad * precio_unitario

            $table->timestamps();                         // created_at / updated_at

            $table->foreign('id_cliente')
                ->references('id_cliente')
                ->on('clientes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('id_producto')
                ->references('id_producto')
                ->on('productos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->unique(['id_cliente', 'id_producto']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrito');
    }
};