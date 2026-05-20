<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: favoritos
 * Uso: Registra productos favoritos de los clientes.
 * Relaciones:
 * - favoritos.id_cliente  -> clientes.id_cliente
 * - favoritos.id_producto -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoritos', function (Blueprint $table) {
            $table->id('id_favorito');                    // PK

            $table->unsignedBigInteger('id_cliente');     // FK clientes
            $table->unsignedBigInteger('id_producto');    // FK productos

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
        Schema::dropIfExists('favoritos');
    }
};