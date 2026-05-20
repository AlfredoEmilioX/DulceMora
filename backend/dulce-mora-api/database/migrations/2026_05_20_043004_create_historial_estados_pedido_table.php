<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: historial_estados_pedido
 * Uso: Registra los cambios de estado de cada pedido.
 * Relaciones:
 * - historial_estados_pedido.id_pedido  -> pedidos.id_pedido
 * - historial_estados_pedido.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_estados_pedido', function (Blueprint $table) {
            $table->id('id_historial_estado_pedido');      // PK

            $table->unsignedBigInteger('id_pedido');       // FK pedidos
            $table->unsignedBigInteger('id_usuario')->nullable(); // FK usuarios

            $table->string('estado_anterior', 30)->nullable(); // Estado previo
            $table->string('estado_nuevo', 30);            // Nuevo estado
            $table->text('observacion')->nullable();       // Comentario del cambio

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
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_estados_pedido');
    }
};