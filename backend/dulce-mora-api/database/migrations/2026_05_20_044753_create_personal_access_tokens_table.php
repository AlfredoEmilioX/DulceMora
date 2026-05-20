<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: personal_access_tokens
 * Uso: Almacena tokens de acceso API para autenticación con Sanctum.
 * Relación: Polimórfica mediante tokenable_type y tokenable_id.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();                                  // PK

            $table->morphs('tokenable');                   // tokenable_type / tokenable_id
            $table->string('name');                        // Nombre del token
            $table->string('token', 64)->unique();         // Token cifrado
            $table->text('abilities')->nullable();         // Permisos del token

            $table->timestamp('last_used_at')->nullable(); // Último uso
            $table->timestamp('expires_at')->nullable();   // Expiración

            $table->timestamps();                          // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};