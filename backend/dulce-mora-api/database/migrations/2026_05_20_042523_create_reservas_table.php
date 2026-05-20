<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: reservas
 * Uso: Registra reservas de productos o pedidos programados.
 * Relaciones:
 * - reservas.id_cliente -> clientes.id_cliente
 * - reservas.id_sede    -> sedes.id_sede
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id('id_reserva');                      // PK

            $table->unsignedBigInteger('id_cliente');      // FK clientes
            $table->unsignedBigInteger('id_sede');         // FK sedes

            $table->dateTime('fecha_reserva');             // Fecha de registro
            $table->dateTime('fecha_recojo')->nullable();  // Fecha programada de recojo

            $table->decimal('subtotal', 10, 2)->default(0);// Subtotal
            $table->decimal('adelanto', 10, 2)->default(0);// Pago adelantado
            $table->decimal('total', 10, 2);               // Total de la reserva

            $table->string('estado_reserva', 30)->default('pendiente');
            // pendiente, confirmada, atendida, cancelada

            $table->text('observacion')->nullable();       // Comentarios
            $table->timestamps();                          // created_at / updated_at

            $table->foreign('id_cliente')
                ->references('id_cliente')
                ->on('clientes')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('id_sede')
                ->references('id_sede')
                ->on('sedes')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};