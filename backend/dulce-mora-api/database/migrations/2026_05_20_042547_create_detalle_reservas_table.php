<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: detalle_reservas
 * Uso: Registra los productos incluidos en cada reserva.
 * Relaciones:
 * - detalle_reservas.id_reserva  -> reservas.id_reserva
 * - detalle_reservas.id_producto -> productos.id_producto
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detalle_reservas', function (Blueprint $table) {
            $table->id('id_detalle_reserva');              // PK

            $table->unsignedBigInteger('id_reserva');      // FK reservas
            $table->unsignedBigInteger('id_producto');     // FK productos

            $table->integer('cantidad');                   // Cantidad reservada
            $table->decimal('precio_unitario', 10, 2);     // Precio al momento de reservar
            $table->decimal('subtotal', 10, 2);            // cantidad * precio_unitario

            $table->timestamps();                          // created_at / updated_at

            $table->foreign('id_reserva')
                ->references('id_reserva')
                ->on('reservas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('id_producto')
                ->references('id_producto')
                ->on('productos')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_reservas');
    }
};