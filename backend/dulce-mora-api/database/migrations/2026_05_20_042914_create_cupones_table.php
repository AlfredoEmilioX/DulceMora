<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: cupones
 * Uso: Registra códigos de descuento para ventas o pedidos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cupones', function (Blueprint $table) {
            $table->id('id_cupon');                         // PK

            $table->string('codigo', 50)->unique();         // Código único del cupón
            $table->string('descripcion', 200)->nullable(); // Descripción opcional
            $table->string('tipo_descuento', 30);           // porcentaje, monto_fijo
            $table->decimal('valor_descuento', 10, 2);      // Valor del descuento

            $table->decimal('monto_minimo', 10, 2)->default(0); // Compra mínima
            $table->integer('limite_uso')->nullable();      // Cantidad máxima de usos
            $table->integer('usos_actuales')->default(0);   // Usos realizados

            $table->date('fecha_inicio');                   // Inicio de vigencia
            $table->date('fecha_fin');                      // Fin de vigencia

            $table->boolean('estado')->default(true);       // Activo/Inactivo
            $table->timestamps();                           // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cupones');
    }
};