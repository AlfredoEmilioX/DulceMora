<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: cupon_cliente
 * Uso: Registra cupones asignados o utilizados por clientes.
 * Relaciones:
 * - cupon_cliente.id_cupon   -> cupones.id_cupon
 * - cupon_cliente.id_cliente -> clientes.id_cliente
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cupon_cliente', function (Blueprint $table) {
            $table->id('id_cupon_cliente');              // PK

            $table->unsignedBigInteger('id_cupon');      // FK cupones
            $table->unsignedBigInteger('id_cliente');    // FK clientes

            $table->dateTime('fecha_asignacion');        // Fecha de asignación
            $table->dateTime('fecha_uso')->nullable();   // Fecha en que se usó
            $table->boolean('usado')->default(false);    // Estado de uso

            $table->timestamps();                        // created_at / updated_at

            $table->foreign('id_cupon')
                ->references('id_cupon')
                ->on('cupones')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('id_cliente')
                ->references('id_cliente')
                ->on('clientes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->unique(['id_cupon', 'id_cliente']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cupon_cliente');
    }
};