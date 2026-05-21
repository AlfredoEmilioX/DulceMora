<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

/**
 * Controlador: BannerController
 * Uso: CRUD API para banners de la web pública.
 */
class BannerController extends Controller
{
    public function index()
    {
        return response()->json(Banner::orderBy('orden')->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:120',
            'subtitulo' => 'nullable|string|max:200',
            'imagen' => 'required|string|max:255',
            'enlace' => 'nullable|string|max:255',
            'orden' => 'nullable|integer|min:1',
            'estado' => 'boolean',
        ]);

        $banner = Banner::create($request->only([
            'titulo',
            'subtitulo',
            'imagen',
            'enlace',
            'orden',
            'estado',
        ]));

        return response()->json([
            'message' => 'Banner registrado correctamente',
            'data' => $banner,
        ], 201);
    }

    public function show($id)
    {
        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json(['message' => 'Banner no encontrado'], 404);
        }

        return response()->json($banner, 200);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json(['message' => 'Banner no encontrado'], 404);
        }

        $request->validate([
            'titulo' => 'required|string|max:120',
            'subtitulo' => 'nullable|string|max:200',
            'imagen' => 'required|string|max:255',
            'enlace' => 'nullable|string|max:255',
            'orden' => 'nullable|integer|min:1',
            'estado' => 'boolean',
        ]);

        $banner->update($request->only([
            'titulo',
            'subtitulo',
            'imagen',
            'enlace',
            'orden',
            'estado',
        ]));

        return response()->json([
            'message' => 'Banner actualizado correctamente',
            'data' => $banner,
        ], 200);
    }

    public function destroy($id)
    {
        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json(['message' => 'Banner no encontrado'], 404);
        }

        $banner->delete();

        return response()->json([
            'message' => 'Banner eliminado correctamente',
        ], 200);
    }
}