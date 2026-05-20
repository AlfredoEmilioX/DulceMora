<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: pedidos
 * Uso: Registra pedidos realizados por clientes para entrega o recojo.
 * Relaciones:
 * - pedidos.id_cliente -> clientes.id_cliente
 * - pedidos.id_usuario -> usuarios.id_usuario
 * - pedidos.id_sede    -> sedes.id_sede
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id('id_pedido');                              // PK

            $table->unsignedBigInteger('id_cliente');             // FK clientes
            $table->unsignedBigInteger('id_usuario')->nullable(); // FK usuarios
            $table->unsignedBigInteger('id_sede');                // FK sedes

            $table->dateTime('fecha_pedido');                     // Fecha del pedido
            $table->dateTime('fecha_entrega')->nullable();        // Fecha estimada/real de entrega

            $table->string('tipo_entrega', 30);                   // delivery, recojo_tienda
            $table->string('direccion_entrega', 200)->nullable(); // Dirección si es delivery

            $table->decimal('subtotal', 10, 2)->default(0);       // Total sin descuentos
            $table->decimal('costo_envio', 10, 2)->default(0);    // Costo delivery
            $table->decimal('descuento', 10, 2)->default(0);      // Descuento aplicado
            $table->decimal('total', 10, 2);                      // Total final

            $table->string('metodo_pago', 30)->nullable();        // Efectivo, Yape, Plin, Tarjeta
            $table->string('estado_pedido', 30)->default('pendiente'); 
            // pendiente, confirmado, preparado, enviado, entregado, cancelado

            $table->text('observacion')->nullable();              // Comentarios del pedido
            $table->timestamps();                                 // created_at / updated_at

            $table->foreign('id_cliente')
                ->references('id_cliente')
                ->on('clientes')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('id_sede')
                ->references('id_sede')
                ->on('sedes')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};