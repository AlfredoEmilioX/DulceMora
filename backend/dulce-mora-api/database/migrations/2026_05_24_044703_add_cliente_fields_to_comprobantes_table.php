<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega datos del cliente al comprobante.
     */
    public function up(): void
    {
        Schema::table('comprobantes', function (Blueprint $table) {
            $table->string('tipo_documento_cliente', 20)->nullable()->after('fecha_emision');
            $table->string('numero_documento_cliente', 20)->nullable()->after('tipo_documento_cliente');
            $table->string('nombre_cliente', 200)->nullable()->after('numero_documento_cliente');
            $table->string('direccion_cliente', 200)->nullable()->after('nombre_cliente');
        });
    }

    /**
     * Revierte los campos agregados.
     */
    public function down(): void
    {
        Schema::table('comprobantes', function (Blueprint $table) {
            $table->dropColumn([
                'tipo_documento_cliente',
                'numero_documento_cliente',
                'nombre_cliente',
                'direccion_cliente',
            ]);
        });
    }
};