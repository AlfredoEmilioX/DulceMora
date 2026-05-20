<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: usuarios
 * Uso: Registra los usuarios internos del sistema.
 * Relaciones:
 * - usuarios.id_rol  -> roles.id_rol
 * - usuarios.id_sede -> sedes.id_sede
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');                    // PK

            $table->unsignedBigInteger('id_rol');        // FK roles
            $table->unsignedBigInteger('id_sede')->nullable(); // FK sedes

            $table->string('nombres', 100);
            $table->string('apellidos', 100)->nullable();
            $table->string('email', 150)->unique();
            $table->string('password')->nullable();

            $table->string('telefono', 20)->nullable();
            $table->string('google_id', 150)->nullable()->unique();

            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('estado')->default(true);
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('id_rol')
                ->references('id_rol')
                ->on('roles')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('id_sede')
                ->references('id_sede')
                ->on('sedes')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};