<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cupon;
use Illuminate\Http\Request;

/**
 * Controlador: CuponController
 * Uso: CRUD API para cupones de descuento.
 */
class CuponController extends Controller
{
    public function index()
    {
        return response()->json(Cupon::with('clientes')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string|max:50|unique:cupones,codigo',
            'descripcion' => 'nullable|string|max:200',
            'tipo_descuento' => 'required|string|max:30',
            'valor_descuento' => 'required|numeric|min:0',
            'monto_minimo' => 'nullable|numeric|min:0',
            'limite_uso' => 'nullable|integer|min:1',
            'usos_actuales' => 'nullable|integer|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'estado' => 'boolean',
        ]);

        $cupon = Cupon::create($request->only([
            'codigo',
            'descripcion',
            'tipo_descuento',
            'valor_descuento',
            'monto_minimo',
            'limite_uso',
            'usos_actuales',
            'fecha_inicio',
            'fecha_fin',
            'estado',
        ]));

        return response()->json([
            'message' => 'Cupón registrado correctamente',
            'data' => $cupon,
        ], 201);
    }

    public function show($id)
    {
        $cupon = Cupon::with('clientes')->find($id);

        if (!$cupon) {
            return response()->json(['message' => 'Cupón no encontrado'], 404);
        }

        return response()->json($cupon, 200);
    }

    public function update(Request $request, $id)
    {
        $cupon = Cupon::find($id);

        if (!$cupon) {
            return response()->json(['message' => 'Cupón no encontrado'], 404);
        }

        $request->validate([
            'codigo' => 'required|string|max:50|unique:cupones,codigo,' . $id . ',id_cupon',
            'descripcion' => 'nullable|string|max:200',
            'tipo_descuento' => 'required|string|max:30',
            'valor_descuento' => 'required|numeric|min:0',
            'monto_minimo' => 'nullable|numeric|min:0',
            'limite_uso' => 'nullable|integer|min:1',
            'usos_actuales' => 'nullable|integer|min:0',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'estado' => 'boolean',
        ]);

        $cupon->update($request->only([
            'codigo',
            'descripcion',
            'tipo_descuento',
            'valor_descuento',
            'monto_minimo',
            'limite_uso',
            'usos_actuales',
            'fecha_inicio',
            'fecha_fin',
            'estado',
        ]));

        return response()->json([
            'message' => 'Cupón actualizado correctamente',
            'data' => $cupon,
        ], 200);
    }

    public function destroy($id)
    {
        $cupon = Cupon::find($id);

        if (!$cupon) {
            return response()->json(['message' => 'Cupón no encontrado'], 404);
        }

        $cupon->delete();

        return response()->json([
            'message' => 'Cupón eliminado correctamente',
        ], 200);
    }
}