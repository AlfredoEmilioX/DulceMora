<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: ventas
 * Uso: Registra las ventas realizadas en el sistema.
 * Relaciones:
 * - ventas.id_cliente -> clientes.id_cliente
 * - ventas.id_usuario -> usuarios.id_usuario
 * - ventas.id_sede    -> sedes.id_sede
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id('id_venta');                              // PK

            $table->unsignedBigInteger('id_cliente')->nullable(); // FK clientes
            $table->unsignedBigInteger('id_usuario');             // FK usuarios
            $table->unsignedBigInteger('id_sede');                // FK sedes

            $table->dateTime('fecha_venta');                      // Fecha y hora de venta
            $table->decimal('subtotal', 10, 2)->default(0);        // Total sin descuentos
            $table->decimal('descuento', 10, 2)->default(0);       // Descuento aplicado
            $table->decimal('total', 10, 2);                       // Total final

            $table->string('metodo_pago', 30);                    // Efectivo, Yape, Plin, Tarjeta
            $table->string('estado_venta', 30)->default('pagada'); // pagada, anulada, pendiente

            $table->timestamps();                                 // created_at / updated_at

            $table->foreign('id_cliente')
                ->references('id_cliente')
                ->on('clientes')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuarios')
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
        Schema::dropIfExists('ventas');
    }
};