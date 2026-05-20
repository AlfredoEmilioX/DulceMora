<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: pagos
 * Uso: Registra pagos asociados a ventas o pedidos.
 * Relaciones:
 * - pagos.id_venta  -> ventas.id_venta
 * - pagos.id_pedido -> pedidos.id_pedido
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id('id_pago');                         // PK

            $table->unsignedBigInteger('id_venta')->nullable();  // FK ventas
            $table->unsignedBigInteger('id_pedido')->nullable(); // FK pedidos

            $table->string('metodo_pago', 30);             // efectivo, yape, plin, tarjeta
            $table->decimal('monto', 10, 2);               // Monto pagado
            $table->dateTime('fecha_pago');                // Fecha/hora del pago

            $table->string('codigo_operacion', 80)->nullable(); // Código Yape/Plin/tarjeta
            $table->string('estado_pago', 30)->default('pagado'); 
            // pagado, pendiente, rechazado, anulado

            $table->text('observacion')->nullable();       // Comentarios
            $table->timestamps();                          // created_at / updated_at

            $table->foreign('id_venta')
                ->references('id_venta')
                ->on('ventas')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('id_pedido')
                ->references('id_pedido')
                ->on('pedidos')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};