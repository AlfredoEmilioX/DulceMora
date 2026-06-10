<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comprobante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Controlador: ComprobanteController
 * Uso: CRUD API para comprobantes de venta.
 */
class ComprobanteController extends Controller
{
    public function index()
    {
        return response()->json(
            Comprobante::with('venta')->orderByDesc('fecha_emision')->get(),
            200
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_venta' => 'required|exists:ventas,id_venta',
            'tipo_comprobante' => 'required|string|max:30',
            'serie' => 'required|string|max:10',
            'numero' => 'required|string|max:20',
            'fecha_emision' => 'required|date',

            'tipo_documento_cliente' => 'nullable|string|max:20',
            'numero_documento_cliente' => 'nullable|string|max:20',
            'nombre_cliente' => 'nullable|string|max:200',
            'direccion_cliente' => 'nullable|string|max:200',

            'subtotal' => 'required|numeric|min:0',
            'igv' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'estado_comprobante' => 'nullable|string|max:30',
        ]);

        $comprobante = Comprobante::create($request->only([
            'id_venta',
            'tipo_comprobante',
            'serie',
            'numero',
            'fecha_emision',
            'tipo_documento_cliente',
            'numero_documento_cliente',
            'nombre_cliente',
            'direccion_cliente',
            'subtotal',
            'igv',
            'total',
            'estado_comprobante',
        ]));

        return response()->json([
            'message' => 'Comprobante registrado correctamente',
            'data' => $comprobante,
        ], 201);
    }

    public function show($id)
    {
        $comprobante = Comprobante::with('venta')->find($id);

        if (!$comprobante) {
            return response()->json([
                'message' => 'Comprobante no encontrado',
            ], 404);
        }

        return response()->json($comprobante, 200);
    }

    public function update(Request $request, $id)
    {
        $comprobante = Comprobante::find($id);

        if (!$comprobante) {
            return response()->json([
                'message' => 'Comprobante no encontrado',
            ], 404);
        }

        $request->validate([
            'id_venta' => 'required|exists:ventas,id_venta',
            'tipo_comprobante' => 'required|string|max:30',
            'serie' => 'required|string|max:10',
            'numero' => 'required|string|max:20',
            'fecha_emision' => 'required|date',

            'tipo_documento_cliente' => 'nullable|string|max:20',
            'numero_documento_cliente' => 'nullable|string|max:20',
            'nombre_cliente' => 'nullable|string|max:200',
            'direccion_cliente' => 'nullable|string|max:200',

            'subtotal' => 'required|numeric|min:0',
            'igv' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'estado_comprobante' => 'nullable|string|max:30',
        ]);

        $comprobante->update($request->only([
            'id_venta',
            'tipo_comprobante',
            'serie',
            'numero',
            'fecha_emision',
            'tipo_documento_cliente',
            'numero_documento_cliente',
            'nombre_cliente',
            'direccion_cliente',
            'subtotal',
            'igv',
            'total',
            'estado_comprobante',
        ]));

        return response()->json([
            'message' => 'Comprobante actualizado correctamente',
            'data' => $comprobante,
        ], 200);
    }

    public function destroy($id)
    {
        $comprobante = Comprobante::find($id);

        if (!$comprobante) {
            return response()->json([
                'message' => 'Comprobante no encontrado',
            ], 404);
        }

        $comprobante->delete();

        return response()->json([
            'message' => 'Comprobante eliminado correctamente',
        ], 200);
    }

    /**
     * Generar comprobante desde una venta.
     * Tipos permitidos:
     * - boleta
     * - factura
     * - ticket
     */
    public function generarDesdeVenta(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_venta' => 'required|exists:ventas,id_venta',
            'tipo_comprobante' => 'required|in:boleta,factura,ticket',

            // Para factura se pueden enviar manualmente estos datos.
            'ruc' => 'nullable|string|max:11',
            'razon_social' => 'nullable|string|max:200',
            'direccion_fiscal' => 'nullable|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tipoComprobante = $request->tipo_comprobante;

        $venta = DB::table('ventas')
            ->leftJoin('clientes', 'ventas.id_cliente', '=', 'clientes.id_cliente')
            ->join('sedes', 'ventas.id_sede', '=', 'sedes.id_sede')
            ->where('ventas.id_venta', $request->id_venta)
            ->select(
                'ventas.id_venta',
                'ventas.subtotal',
                'ventas.descuento',
                'ventas.total',
                'ventas.estado_venta',

                'clientes.id_cliente',
                'clientes.dni',
                'clientes.nombres',
                'clientes.apellidos',
                'clientes.direccion',

                'sedes.id_sede',
                'sedes.nombre_comercial as sede_nombre'
            )
            ->first();

        if (!$venta) {
            return response()->json([
                'message' => 'Venta no encontrada',
            ], 404);
        }

        if ($venta->estado_venta !== 'completada') {
            return response()->json([
                'message' => 'Solo se puede generar comprobante para ventas completadas',
            ], 422);
        }

        $comprobanteExistente = Comprobante::where('id_venta', $venta->id_venta)
            ->where('tipo_comprobante', $tipoComprobante)
            ->first();

        if ($comprobanteExistente) {
            return response()->json([
                'message' => 'Esta venta ya tiene un comprobante de este tipo',
                'data' => $comprobanteExistente,
            ], 200);
        }

        if ($tipoComprobante === 'factura') {
            if (!$request->ruc || !$request->razon_social) {
                return response()->json([
                    'message' => 'Para generar factura debes enviar RUC y razón social',
                ], 422);
            }

            $tipoDocumentoCliente = 'RUC';
            $numeroDocumentoCliente = $request->ruc;
            $nombreCliente = $request->razon_social;
            $direccionCliente = $request->direccion_fiscal;
            $serie = 'F001';
        } elseif ($tipoComprobante === 'boleta') {
            $tipoDocumentoCliente = 'DNI';
            $numeroDocumentoCliente = $venta->dni;
            $nombreCliente = trim(($venta->nombres ?? '') . ' ' . ($venta->apellidos ?? ''));
            $direccionCliente = $venta->direccion;
            $serie = 'B001';

            if (!$numeroDocumentoCliente && !$nombreCliente) {
                $nombreCliente = 'Cliente general';
            }
        } else {
            $tipoDocumentoCliente = null;
            $numeroDocumentoCliente = null;
            $nombreCliente = 'Cliente general';
            $direccionCliente = null;
            $serie = 'T001';
        }

        $ultimoNumero = Comprobante::where('serie', $serie)->max('numero');

        $nuevoNumero = $ultimoNumero
            ? str_pad(((int) $ultimoNumero) + 1, 8, '0', STR_PAD_LEFT)
            : '00000001';

        /*
         * Por ahora IGV en 0 porque tus precios ya se están manejando como precio final.
         * Más adelante, si deseas facturación más formal:
         * subtotal_sin_igv = total / 1.18
         * igv = total - subtotal_sin_igv
         */
        $subtotal = $venta->subtotal;
        $igv = 0;
        $total = $venta->total;

        $comprobante = Comprobante::create([
            'id_venta' => $venta->id_venta,
            'tipo_comprobante' => $tipoComprobante,
            'serie' => $serie,
            'numero' => $nuevoNumero,
            'fecha_emision' => now(),

            'tipo_documento_cliente' => $tipoDocumentoCliente,
            'numero_documento_cliente' => $numeroDocumentoCliente,
            'nombre_cliente' => $nombreCliente,
            'direccion_cliente' => $direccionCliente,

            'subtotal' => $subtotal,
            'igv' => $igv,
            'total' => $total,
            'estado_comprobante' => 'emitido',
        ]);

        return response()->json([
            'message' => ucfirst($tipoComprobante) . ' generado correctamente',
            'data' => $comprobante,
        ], 201);
    }
}