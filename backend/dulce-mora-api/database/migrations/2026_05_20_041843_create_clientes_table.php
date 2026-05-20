<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: clientes
 * Uso: Registra los clientes que realizan compras o pedidos.
 * Relación: Será referenciada por ventas.id_cliente y pedidos.id_cliente.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');                         // PK

            $table->string('nombres', 100);                   // Nombre del cliente
            $table->string('apellidos', 100)->nullable();     // Apellidos del cliente
            $table->string('documento', 20)->nullable()->unique(); // DNI/RUC
            $table->string('telefono', 20)->nullable();       // Celular o teléfono
            $table->string('email', 150)->nullable()->unique();// Correo
            $table->string('direccion', 200)->nullable();     // Dirección de entrega
            $table->boolean('estado')->default(true);         // Activo/Inactivo
            $table->timestamps();                             // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};