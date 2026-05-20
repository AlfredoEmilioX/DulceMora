<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: promociones
 * Uso: Registra promociones, descuentos o campañas comerciales.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promociones', function (Blueprint $table) {
            $table->id('id_promocion');                       // PK

            $table->string('nombre_promocion', 120);          // Nombre de la promoción
            $table->string('descripcion', 250)->nullable();   // Detalle opcional
            $table->string('tipo_descuento', 30);             // porcentaje, monto_fijo
            $table->decimal('valor_descuento', 10, 2);        // Valor del descuento

            $table->date('fecha_inicio');                     // Inicio de vigencia
            $table->date('fecha_fin');                        // Fin de vigencia

            $table->decimal('monto_minimo', 10, 2)->default(0); // Compra mínima
            $table->boolean('estado')->default(true);         // Activa/Inactiva

            $table->timestamps();                             // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promociones');
    }
};