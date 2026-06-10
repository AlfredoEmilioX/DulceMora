<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sede;
use Illuminate\Http\Request;

/**
 * Controlador: SedeController
 * Uso: CRUD API para sedes del negocio.
 */
class SedeController extends Controller
{
    public function index()
    {
        $sedes = Sede::withCount(['usuarios', 'productosStock'])
            ->orderBy('id_sede', 'desc')
            ->get();

        return response()->json($sedes, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_comercial' => 'required|string|max:100',
            'direccion' => 'required|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'nullable|boolean',
        ]);

        $sede = Sede::create([
            'nombre_comercial' => $request->nombre_comercial,
            'direccion' => $request->direccion,
            'telefono' => $request->telefono,
            'estado' => $request->has('estado') ? $request->estado : true,
        ]);

        return response()->json([
            'message' => 'Sede registrada correctamente',
            'data' => $sede,
        ], 201);
    }

    public function show($id)
    {
        $sede = Sede::withCount(['usuarios', 'productosStock'])->find($id);

        if (!$sede) {
            return response()->json([
                'message' => 'Sede no encontrada',
            ], 404);
        }

        return response()->json($sede, 200);
    }

    public function update(Request $request, $id)
    {
        $sede = Sede::find($id);

        if (!$sede) {
            return response()->json([
                'message' => 'Sede no encontrada',
            ], 404);
        }

        $request->validate([
            'nombre_comercial' => 'required|string|max:100',
            'direccion' => 'required|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'nullable|boolean',
        ]);

        $sede->update([
            'nombre_comercial' => $request->nombre_comercial,
            'direccion' => $request->direccion,
            'telefono' => $request->telefono,
            'estado' => $request->has('estado') ? $request->estado : $sede->estado,
        ]);

        return response()->json([
            'message' => 'Sede actualizada correctamente',
            'data' => $sede,
        ], 200);
    }

    public function destroy($id)
    {
        $sede = Sede::find($id);

        if (!$sede) {
            return response()->json([
                'message' => 'Sede no encontrada',
            ], 404);
        }

        /*
         * No eliminamos físicamente porque la sede puede estar relacionada
         * con usuarios, ventas, compras, pedidos, reservas o stock.
         * Solo se desactiva.
         */
        $sede->update([
            'estado' => false,
        ]);

        return response()->json([
            'message' => 'Sede desactivada correctamente',
            'data' => $sede,
        ], 200);
    }

    public function cambiarEstado($id)
    {
        $sede = Sede::find($id);

        if (!$sede) {
            return response()->json([
                'message' => 'Sede no encontrada',
            ], 404);
        }

        $sede->update([
            'estado' => !$sede->estado,
        ]);

        return response()->json([
            'message' => $sede->estado
                ? 'Sede activada correctamente'
                : 'Sede desactivada correctamente',
            'data' => $sede,
        ], 200);
    }
}