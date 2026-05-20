<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: recompensas
 * Uso: Registra puntos, beneficios o recompensas asignadas a clientes.
 * Relación:
 * - recompensas.id_cliente -> clientes.id_cliente
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recompensas', function (Blueprint $table) {
            $table->id('id_recompensa');                  // PK

            $table->unsignedBigInteger('id_cliente');     // FK clientes

            $table->integer('puntos')->default(0);        // Puntos acumulados
            $table->string('nivel', 50)->nullable();      // Nivel del cliente
            $table->string('descripcion', 200)->nullable();// Detalle de recompensa
            $table->boolean('estado')->default(true);     // Activa/Inactiva

            $table->timestamps();                         // created_at / updated_at

            $table->foreign('id_cliente')
                ->references('id_cliente')
                ->on('clientes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recompensas');
    }
};