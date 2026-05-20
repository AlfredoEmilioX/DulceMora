<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: sedes
 * Uso: Registra los locales o puntos de venta de Dulce Mora.
 * Relación: Será referenciada por usuarios, ventas, stock y cajas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sedes', function (Blueprint $table) {
            $table->id('id_sede');                         // PK
            $table->string('nombre_comercial', 100);       // Nombre de la sede
            $table->string('direccion', 200);              // Dirección física
            $table->string('telefono', 20)->nullable();    // Teléfono de contacto
            $table->boolean('estado')->default(true);      // Activa/Inactiva
            $table->timestamps();                          // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sedes');
    }
};