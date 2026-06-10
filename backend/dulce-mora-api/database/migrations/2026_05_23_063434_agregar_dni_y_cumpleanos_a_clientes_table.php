<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega campos para DNI, cumpleaños y promociones del cliente.
     */
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('dni', 8)->nullable()->unique()->after('id_cliente');
            $table->date('fecha_nacimiento')->nullable()->after('email');
            $table->boolean('acepta_promociones')->default(true)->after('direccion');
            $table->date('fecha_ultimo_saludo_cumpleanos')->nullable()->after('acepta_promociones');
        });
    }

    /**
     * Revierte los campos agregados.
     */
    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropUnique(['dni']);

            $table->dropColumn([
                'dni',
                'fecha_nacimiento',
                'acepta_promociones',
                'fecha_ultimo_saludo_cumpleanos',
            ]);
        });
    }
};