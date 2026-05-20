<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: notificaciones
 * Uso: Registra avisos internos para usuarios del sistema.
 * Relación:
 * - notificaciones.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id('id_notificacion');                 // PK

            $table->unsignedBigInteger('id_usuario');      // FK usuarios

            $table->string('titulo', 120);                 // Título del aviso
            $table->text('mensaje');                       // Contenido
            $table->string('tipo', 30)->default('info');   // info, alerta, error
            $table->boolean('leido')->default(false);      // Leída/No leída

            $table->timestamps();                          // created_at / updated_at

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};