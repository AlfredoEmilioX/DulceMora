import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  FiRefreshCw,
  FiEye,
  FiPrinter,
} from "react-icons/fi";

function Comprobantes() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatoSoles = (monto) => {
    return `S/ ${Number(monto ?? 0).toFixed(2)}`;
  };

  const cargarComprobantes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/comprobantes");
      setComprobantes(response.data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los comprobantes.");
    } finally {
      setLoading(false);
    }
  };

  const imprimirComprobante = (comprobante) => {
    const contenido = `
      <html>
        <head>
          <title>${comprobante.tipo_comprobante.toUpperCase()} ${comprobante.serie}-${comprobante.numero}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 4mm;
            }

            body {
              padding: 0;
              font-family: Arial, sans-serif;
              color: #111;
              width: 72mm;
              margin: 0 auto;
              font-size: 11px;
            }

            .ticket {
              width: 100%;
            }

            .center {
              text-align: center;
            }

            .logo {
              width: 55px;
              display: block;
              margin: 0 auto 6px auto;
            }

            h1, h2, h3, p {
              margin: 0;
              padding: 0;
            }

            .empresa h2 {
              font-size: 20px;
              margin-bottom: 2px;
            }

            .empresa p,
            .empresa small {
              font-size: 11px;
              line-height: 1.35;
              display: block;
            }

            .separador {
              border-top: 1px dashed #777;
              margin: 10px 0;
            }

            .titulo {
              text-align: center;
              margin: 8px 0;
            }

            .titulo h3 {
              font-size: 14px;
              margin-bottom: 4px;
            }

            .info p {
              margin: 4px 0;
              line-height: 1.35;
            }

            .totales {
              margin-top: 10px;
            }

            .totales .fila {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }

            .totales .final {
              font-size: 15px;
              font-weight: bold;
              border-top: 1px dashed #777;
              padding-top: 7px;
              margin-top: 7px;
            }

            .footer {
              text-align: center;
              margin-top: 12px;
              border-top: 1px dashed #777;
              padding-top: 8px;
            }

            .footer p {
              margin-bottom: 4px;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <div class="ticket">
            <div class="empresa center">
              <img src="/img/logo-dulce-mora.png" alt="Dulce Mora" class="logo" />
              <h2>Dulce Mora</h2>
              <p>Pastelería artesanal</p>
            </div>

            <div class="separador"></div>

            <div class="titulo">
              <h3>${comprobante.tipo_comprobante.toUpperCase()}</h3>
              <p>${comprobante.serie}-${comprobante.numero}</p>
            </div>

            <div class="separador"></div>

            <div class="info">
              <p><strong>Fecha:</strong> ${comprobante.fecha_emision}</p>
              <p><strong>Cliente:</strong> ${comprobante.nombre_cliente || "Cliente general"}</p>
              <p><strong>Documento:</strong> ${comprobante.tipo_documento_cliente || ""} ${comprobante.numero_documento_cliente || ""}</p>
              <p><strong>Dirección:</strong> ${comprobante.direccion_cliente || "No registrada"}</p>
              <p><strong>Venta:</strong> #${comprobante.id_venta}</p>
              <p><strong>Estado:</strong> ${comprobante.estado_comprobante}</p>
            </div>

            <div class="separador"></div>

            <div class="totales">
              <div class="fila">
                <span>Subtotal</span>
                <strong>S/ ${Number(comprobante.subtotal ?? 0).toFixed(2)}</strong>
              </div>

              <div class="fila">
                <span>IGV</span>
                <strong>S/ ${Number(comprobante.igv ?? 0).toFixed(2)}</strong>
              </div>

              <div class="fila final">
                <span>Total</span>
                <strong>S/ ${Number(comprobante.total ?? 0).toFixed(2)}</strong>
              </div>
            </div>

            <div class="footer">
              <p>Gracias por tu compra 💜</p>
              <small>Dulce Mora - Hecho con amor</small>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    const ventana = window.open("", "_blank", "width=420,height=700");
    ventana.document.open();
    ventana.document.write(contenido);
    ventana.document.close();
  };

  useEffect(() => {
    cargarComprobantes();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando comprobantes...</h2>
          <p>Estamos obteniendo las boletas y facturas registradas.</p>
        </div>
      </div>
    );
  }

  return (
    <>
        <header className="dashboard-header">
          <div>
            <span className="dashboard-kicker">Control de comprobantes</span>
            <h1>Boletas y facturas</h1>
            <p>
              Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes ver
              los comprobantes generados por venta.
            </p>
          </div>

          <button className="refresh-button" onClick={cargarComprobantes}>
            <FiRefreshCw />
            Actualizar
          </button>
        </header>

        {error && <div className="dashboard-error">{error}</div>}

        <section className="report-card full-card">
          <div className="report-head">
            <h2>Comprobantes registrados</h2>
            <span>{comprobantes.length} comprobante(s)</span>
          </div>

          {comprobantes.length === 0 ? (
            <p className="empty-text">
              Todavía no hay boletas ni facturas generadas.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Serie</th>
                    <th>Cliente</th>
                    <th>Documento</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {comprobantes.map((comprobante) => (
                    <tr key={comprobante.id_comprobante}>
                      <td>#{comprobante.id_comprobante}</td>
                      <td>
                        <span className={`badge-tipo ${comprobante.tipo_comprobante}`}>
                          {comprobante.tipo_comprobante}
                        </span>
                      </td>
                      <td>
                        <strong>
                          {comprobante.serie}-{comprobante.numero}
                        </strong>
                      </td>
                      <td>{comprobante.nombre_cliente || "Cliente general"}</td>
                      <td>
                        {comprobante.tipo_documento_cliente || "Sin documento"}{" "}
                        {comprobante.numero_documento_cliente || ""}
                      </td>
                      <td>{comprobante.fecha_emision}</td>
                      <td>{formatoSoles(comprobante.total)}</td>
                      <td>
                        <span className="badge-estado">
                          {comprobante.estado_comprobante}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-tabla">
                          <button
                            type="button"
                            className="detalle-btn"
                            onClick={() => imprimirComprobante(comprobante)}
                          >
                            <FiPrinter />
                            Imprimir
                          </button>

                          <Link
                            className="detalle-btn detalle-link"
                            to={`/admin/reportes`}
                          >
                            <FiEye />
                            Ver venta
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </>
  );
}

export default Comprobantes;