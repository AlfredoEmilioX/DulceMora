<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Ejecuta los seeders principales del sistema.
     */
    public function run(): void
    {
        $this->call([
            DatosInicialesSeeder::class,
        ]);
    }
}