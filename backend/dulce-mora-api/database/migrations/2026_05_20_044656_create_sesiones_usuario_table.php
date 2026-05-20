<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: sesiones_usuario
 * Uso: Registra sesiones, tokens e inicios de sesión de usuarios.
 * Relación:
 * - sesiones_usuario.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesiones_usuario', function (Blueprint $table) {
            $table->id('id_sesion');                       // PK

            $table->unsignedBigInteger('id_usuario');      // FK usuarios

            $table->string('token', 255)->nullable();      // Token de sesión/API
            $table->string('ip', 45)->nullable();          // IP del usuario
            $table->string('user_agent', 255)->nullable(); // Navegador/dispositivo

            $table->dateTime('fecha_inicio');              // Inicio de sesión
            $table->dateTime('fecha_fin')->nullable();     // Cierre de sesión

            $table->boolean('activo')->default(true);      // Sesión activa/inactiva
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
        Schema::dropIfExists('sesiones_usuario');
    }
};