<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: categorias
 * Uso: Clasifica los productos del catálogo.
 * Relación: Será referenciada por productos.id_categoria.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id('id_categoria');                  // PK
            $table->string('nombre_categoria', 100);     // Nombre de la categoría
            $table->string('descripcion', 200)->nullable();// Descripción opcional
            $table->boolean('estado')->default(true);    // Activa/Inactiva
            $table->timestamps();                        // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};