<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: auditorias
 * Uso: Registra acciones realizadas por usuarios dentro del sistema.
 * Relación:
 * - auditorias.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auditorias', function (Blueprint $table) {
            $table->id('id_auditoria');                   // PK

            $table->unsignedBigInteger('id_usuario')->nullable(); // FK usuarios

            $table->string('tabla_afectada', 100);        // Tabla modificada
            $table->unsignedBigInteger('id_registro')->nullable(); // ID del registro afectado
            $table->string('accion', 30);                 // crear, actualizar, eliminar, login
            $table->text('descripcion')->nullable();      // Detalle de la acción

            $table->string('ip', 45)->nullable();         // IP del usuario
            $table->string('user_agent', 255)->nullable();// Navegador/dispositivo

            $table->timestamps();                         // created_at / updated_at

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditorias');
    }
};