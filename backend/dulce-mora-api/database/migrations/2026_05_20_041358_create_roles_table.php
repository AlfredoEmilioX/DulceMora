<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: roles
 * Uso: Define los permisos o perfiles de acceso del sistema.
 * Relación: Será referenciada por usuarios.id_rol.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id('id_rol');                         // PK
            $table->string('nombre_rol', 50)->unique();   // Nombre único del rol
            $table->string('descripcion', 150)->nullable();// Descripción funcional
            $table->boolean('estado')->default(true);     // Activo/Inactivo
            $table->timestamps();                         // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};