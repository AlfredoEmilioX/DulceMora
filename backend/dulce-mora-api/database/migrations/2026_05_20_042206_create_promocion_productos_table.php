<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: promocion_productos
 * Uso: Relaciona promociones con productos específicos.
 * Relaciones:
 * - promocion_productos.id_promocion -> promociones.id_promocion
 * - promocion_productos.id_producto  -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promocion_productos', function (Blueprint $table) {
            $table->id('id_promocion_producto');          // PK

            $table->unsignedBigInteger('id_promocion');   // FK promociones
            $table->unsignedBigInteger('id_producto');    // FK productos

            $table->timestamps();                         // created_at / updated_at

            $table->foreign('id_promocion')
                ->references('id_promocion')
                ->on('promociones')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('id_producto')
                ->references('id_producto')
                ->on('productos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->unique(['id_promocion', 'id_producto']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promocion_productos');
    }
};