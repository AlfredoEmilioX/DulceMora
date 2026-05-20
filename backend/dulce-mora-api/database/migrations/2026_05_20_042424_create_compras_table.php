<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: compras
 * Uso: Registra compras realizadas a proveedores.
 * Relaciones:
 * - compras.id_proveedor -> proveedores.id_proveedor
 * - compras.id_usuario   -> usuarios.id_usuario
 * - compras.id_sede      -> sedes.id_sede
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id('id_compra');                        // PK

            $table->unsignedBigInteger('id_proveedor');     // FK proveedores
            $table->unsignedBigInteger('id_usuario');       // FK usuarios
            $table->unsignedBigInteger('id_sede');          // FK sedes

            $table->dateTime('fecha_compra');               // Fecha/hora de compra
            $table->decimal('subtotal', 10, 2)->default(0); // Subtotal
            $table->decimal('igv', 10, 2)->default(0);      // IGV
            $table->decimal('total', 10, 2);                // Total final

            $table->string('tipo_comprobante', 30)->nullable(); // factura, boleta
            $table->string('serie', 10)->nullable();        // Serie comprobante
            $table->string('numero', 20)->nullable();       // Número comprobante

            $table->string('estado_compra', 30)->default('registrada');
            // registrada, anulada

            $table->text('observacion')->nullable();        // Comentarios
            $table->timestamps();                           // created_at / updated_at

            $table->foreign('id_proveedor')
                ->references('id_proveedor')
                ->on('proveedores')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

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
        Schema::dropIfExists('compras');
    }
};