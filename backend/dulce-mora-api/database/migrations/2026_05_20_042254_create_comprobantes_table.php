<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: comprobantes
 * Uso: Registra boletas, facturas o tickets asociados a una venta.
 * Relación:
 * - comprobantes.id_venta -> ventas.id_venta
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comprobantes', function (Blueprint $table) {
            $table->id('id_comprobante');                 // PK

            $table->unsignedBigInteger('id_venta');       // FK ventas

            $table->string('tipo_comprobante', 30);       // boleta, factura, ticket
            $table->string('serie', 10);                  // Serie del comprobante
            $table->string('numero', 20);                 // Número correlativo

            $table->dateTime('fecha_emision');            // Fecha de emisión
            $table->decimal('subtotal', 10, 2);           // Subtotal gravado
            $table->decimal('igv', 10, 2)->default(0);    // Impuesto IGV
            $table->decimal('total', 10, 2);              // Total del comprobante

            $table->string('estado_comprobante', 30)->default('emitido'); 
            // emitido, anulado

            $table->timestamps();                         // created_at / updated_at

            $table->foreign('id_venta')
                ->references('id_venta')
                ->on('ventas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->unique(['tipo_comprobante', 'serie', 'numero']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comprobantes');
    }
};