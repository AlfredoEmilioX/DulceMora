<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: recuperacion_contrasenas
 * Uso: Gestiona tokens para restablecer contraseñas de usuarios.
 * Relación:
 * - recuperacion_contrasenas.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recuperacion_contrasenas', function (Blueprint $table) {
            $table->id('id_recuperacion');                 // PK

            $table->unsignedBigInteger('id_usuario');      // FK usuarios

            $table->string('email', 150);                  // Correo asociado
            $table->string('token', 255);                  // Token de recuperación
            $table->dateTime('fecha_expiracion');          // Fecha límite de uso
            $table->boolean('usado')->default(false);      // Token usado/no usado

            $table->timestamps();                          // created_at / updated_at

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->index('email');
            $table->unique('token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recuperacion_contrasenas');
    }
};