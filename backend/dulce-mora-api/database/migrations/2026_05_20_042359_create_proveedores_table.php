<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: proveedores
 * Uso: Registra proveedores para compras y abastecimiento.
 * Relación: Será referenciada por compras.id_proveedor.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('id_proveedor');                    // PK

            $table->string('razon_social', 150);           // Nombre o razón social
            $table->string('ruc', 20)->nullable()->unique();// RUC del proveedor
            $table->string('telefono', 20)->nullable();    // Teléfono de contacto
            $table->string('email', 150)->nullable();      // Correo de contacto
            $table->string('direccion', 200)->nullable();  // Dirección
            $table->boolean('estado')->default(true);      // Activo/Inactivo

            $table->timestamps();                          // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};