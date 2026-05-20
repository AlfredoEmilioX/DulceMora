<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: cajas
 * Uso: Controla la apertura y cierre de caja por sede y usuario.
 * Relaciones:
 * - cajas.id_sede    -> sedes.id_sede
 * - cajas.id_usuario -> usuarios.id_usuario
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cajas', function (Blueprint $table) {
            $table->id('id_caja');                          // PK

            $table->unsignedBigInteger('id_sede');          // FK sedes
            $table->unsignedBigInteger('id_usuario');       // FK usuarios

            $table->dateTime('fecha_apertura');             // Fecha/hora apertura
            $table->dateTime('fecha_cierre')->nullable();   // Fecha/hora cierre

            $table->decimal('monto_inicial', 10, 2);        // Monto inicial
            $table->decimal('monto_final', 10, 2)->nullable(); // Monto al cierre
            $table->decimal('total_ventas', 10, 2)->default(0); // Ventas registradas

            $table->string('estado_caja', 30)->default('abierta'); 
            // abierta, cerrada

            $table->text('observacion')->nullable();        // Comentarios
            $table->timestamps();                           // created_at / updated_at

            $table->foreign('id_sede')
                ->references('id_sede')
                ->on('sedes')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cajas');
    }
};