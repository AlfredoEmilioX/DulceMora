<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controlador: UsuarioController
 * Uso: CRUD API para usuarios internos del sistema.
 */
class UsuarioController extends Controller
{
    public function index()
    {
        $usuarios = Usuario::with(['rol', 'sede'])
            ->orderBy('id_usuario', 'desc')
            ->get();

        return response()->json($usuarios, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_rol' => 'required|exists:roles,id_rol',
            'id_sede' => 'nullable|exists:sedes,id_sede',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'nullable|string|max:100',
            'email' => 'required|email|max:150|unique:usuarios,email',
            'password' => 'required|string|min:6',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'nullable|boolean',
        ]);

        $usuario = Usuario::create([
            'id_rol' => $request->id_rol,
            'id_sede' => $request->id_sede,
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telefono' => $request->telefono,
            'estado' => $request->has('estado') ? $request->estado : true,
        ]);

        $usuario->load(['rol', 'sede']);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'data' => $usuario,
        ], 201);
    }

    public function show($id)
    {
        $usuario = Usuario::with(['rol', 'sede'])->find($id);

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        return response()->json($usuario, 200);
    }

    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        $request->validate([
            'id_rol' => 'required|exists:roles,id_rol',
            'id_sede' => 'nullable|exists:sedes,id_sede',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'nullable|string|max:100',
            'email' => 'required|email|max:150|unique:usuarios,email,' . $id . ',id_usuario',
            'password' => 'nullable|string|min:6',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'nullable|boolean',
        ]);

        $datos = [
            'id_rol' => $request->id_rol,
            'id_sede' => $request->id_sede,
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'estado' => $request->has('estado') ? $request->estado : $usuario->estado,
        ];

        /*
         * Si se envía una nueva contraseña, se actualiza.
         * Si se deja vacío, se mantiene la contraseña actual.
         */
        if ($request->filled('password')) {
            $datos['password'] = Hash::make($request->password);
        }

        $usuario->update($datos);

        $usuario->load(['rol', 'sede']);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'data' => $usuario,
        ], 200);
    }

    public function destroy($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        /*
         * No se elimina físicamente porque puede estar relacionado
         * con ventas, pedidos, compras, movimientos de stock o auditoría.
         * Solo se desactiva.
         */
        $usuario->update([
            'estado' => false,
        ]);

        $usuario->load(['rol', 'sede']);

        return response()->json([
            'message' => 'Usuario desactivado correctamente',
            'data' => $usuario,
        ], 200);
    }

    public function cambiarEstado($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        $usuario->update([
            'estado' => !$usuario->estado,
        ]);

        $usuario->load(['rol', 'sede']);

        return response()->json([
            'message' => $usuario->estado
                ? 'Usuario activado correctamente'
                : 'Usuario desactivado correctamente',
            'data' => $usuario,
        ], 200);
    }
}