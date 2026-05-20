<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: opiniones
 * Uso: Registra valoraciones y comentarios de clientes sobre productos.
 * Relaciones:
 * - opiniones.id_cliente  -> clientes.id_cliente
 * - opiniones.id_producto -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opiniones', function (Blueprint $table) {
            $table->id('id_opinion');                       // PK

            $table->unsignedBigInteger('id_cliente');       // FK clientes
            $table->unsignedBigInteger('id_producto');      // FK productos

            $table->tinyInteger('calificacion');            // Valoración 1 a 5
            $table->text('comentario')->nullable();         // Comentario del cliente
            $table->boolean('estado')->default(true);       // Visible/Oculto

            $table->timestamps();                           // created_at / updated_at

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
        Schema::dropIfExists('opiniones');
    }
};