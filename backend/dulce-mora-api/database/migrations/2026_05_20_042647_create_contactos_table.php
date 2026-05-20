<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: contactos
 * Uso: Registra mensajes enviados desde la web pública.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contactos', function (Blueprint $table) {
            $table->id('id_contacto');                     // PK

            $table->string('nombres', 120);                // Nombre del visitante
            $table->string('email', 150)->nullable();      // Correo de contacto
            $table->string('telefono', 20)->nullable();    // Teléfono o WhatsApp
            $table->string('asunto', 150);                 // Motivo del mensaje
            $table->text('mensaje');                       // Contenido del mensaje

            $table->string('estado_contacto', 30)->default('pendiente');
            // pendiente, atendido, descartado

            $table->timestamps();                          // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contactos');
    }
};