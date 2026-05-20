<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: productos
 * Uso: Registra los productos del catálogo de Dulce Mora.
 * Relación:
 * - productos.id_categoria -> categorias.id_categoria
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');                         // PK

            $table->unsignedBigInteger('id_categoria');        // FK categorias

            $table->string('nombre_producto', 120);            // Nombre del producto
            $table->string('descripcion', 250)->nullable();    // Descripción breve
            $table->decimal('precio', 10, 2);                  // Precio de venta
            $table->string('imagen', 255)->nullable();         // Ruta o nombre de imagen
            $table->boolean('estado')->default(true);          // Activo/Inactivo
            $table->timestamps();                              // created_at / updated_at

            $table->foreign('id_categoria')
                ->references('id_categoria')
                ->on('categorias')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};