<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: stock
 * Uso: Controla la cantidad disponible de productos por sede.
 * Relaciones:
 * - stock.id_producto -> productos.id_producto
 * - stock.id_sede     -> sedes.id_sede
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock', function (Blueprint $table) {
            $table->id('id_stock');                       // PK

            $table->unsignedBigInteger('id_producto');    // FK productos
            $table->unsignedBigInteger('id_sede');        // FK sedes

            $table->integer('cantidad')->default(0);      // Stock actual
            $table->integer('stock_minimo')->default(0);  // Alerta de reposición
            $table->boolean('estado')->default(true);     // Activo/Inactivo

            $table->timestamps();                         // created_at / updated_at

            $table->foreign('id_producto')
                ->references('id_producto')
                ->on('productos')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('id_sede')
                ->references('id_sede')
                ->on('sedes')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->unique(['id_producto', 'id_sede']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock');
    }
};