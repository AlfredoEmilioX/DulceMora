<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: configuraciones
 * Uso: Guarda datos generales del negocio y parámetros visuales del sistema.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuraciones', function (Blueprint $table) {
            $table->id('id_configuracion');                 // PK

            $table->string('nombre_negocio', 120);          // Nombre comercial
            $table->string('logo', 255)->nullable();        // Ruta del logo
            $table->string('color_primario', 20)->nullable();// Color principal HEX
            $table->string('color_secundario', 20)->nullable();// Color secundario HEX

            $table->string('telefono', 20)->nullable();     // Teléfono general
            $table->string('whatsapp', 20)->nullable();     // WhatsApp
            $table->string('email', 150)->nullable();       // Correo corporativo
            $table->string('direccion', 200)->nullable();   // Dirección principal

            $table->string('facebook', 255)->nullable();    // URL Facebook
            $table->string('instagram', 255)->nullable();   // URL Instagram
            $table->string('tiktok', 255)->nullable();      // URL TikTok

            $table->boolean('estado')->default(true);       // Activa/Inactiva
            $table->timestamps();                           // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuraciones');
    }
};