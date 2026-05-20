<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: banners
 * Uso: Administra imágenes promocionales de la web pública.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id('id_banner');                       // PK

            $table->string('titulo', 120);                 // Título del banner
            $table->string('subtitulo', 200)->nullable();  // Texto complementario
            $table->string('imagen', 255);                 // Ruta de imagen
            $table->string('enlace', 255)->nullable();     // URL opcional
            $table->integer('orden')->default(1);          // Orden visual
            $table->boolean('estado')->default(true);      // Activo/Inactivo

            $table->timestamps();                          // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};