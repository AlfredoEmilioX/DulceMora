<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: delivery
 * Uso: Registra la información de entrega de los pedidos.
 * Relaciones:
 * - delivery.id_pedido  -> pedidos.id_pedido
 * - delivery.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery', function (Blueprint $table) {
            $table->id('id_delivery');                     // PK

            $table->unsignedBigInteger('id_pedido');       // FK pedidos
            $table->unsignedBigInteger('id_usuario')->nullable(); // FK repartidor/usuario

            $table->string('direccion_entrega', 200);      // Dirección de entrega
            $table->string('referencia', 200)->nullable(); // Referencia del domicilio
            $table->decimal('costo_delivery', 10, 2)->default(0); // Costo de envío

            $table->dateTime('fecha_salida')->nullable();  // Inicio del reparto
            $table->dateTime('fecha_entrega')->nullable(); // Entrega completada

            $table->string('estado_delivery', 30)->default('pendiente');
            // pendiente, en_camino, entregado, cancelado

            $table->text('observacion')->nullable();       // Comentarios
            $table->timestamps();                          // created_at / updated_at

            $table->foreign('id_pedido')
                ->references('id_pedido')
                ->on('pedidos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->unique('id_pedido');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery');
    }
};