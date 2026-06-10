import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiCalendar,
  FiDollarSign,
  FiDownload,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import "../../styles/dashboard/historialVentas.css";

function HistorialVentas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const filtrosIniciales = {
    desde: "",
    hasta: "",
    id_sede: "",
    id_usuario: "",
    metodo_pago: "",
    buscar: "",
  };

  const [filtros, setFiltros] = useState(filtrosIniciales);

  const [ventas, setVentas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [detalleVenta, setDetalleVenta] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatoSoles = (monto) => {
    return `S/ ${Number(monto ?? 0).toFixed(2)}`;
  };

  const normalizar = (texto) => {
    return String(texto ?? "").toLowerCase().trim();
  };

  const normalizarLista = (data, clave = "") => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (clave && Array.isArray(data?.[clave])) return data[clave];

    return [];
  };

  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  const construirParams = (filtrosActuales = filtros) => {
    const params = {};

    Object.entries(filtrosActuales).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    return params;
  };

  const cargarListas = async () => {
    try {
      const [sedesRes, usuariosRes] = await Promise.all([
        api.get("/sedes"),
        api.get("/usuarios"),
      ]);

      setSedes(normalizarLista(sedesRes.data, "sedes"));
      setUsuarios(normalizarLista(usuariosRes.data, "usuarios"));
    } catch (err) {
      console.error(err);
    }
  };

  const cargarVentas = async (filtrosActuales = filtros) => {
    try {
      setLoading(true);
      setError("");

      const params = construirParams(filtrosActuales);

      const response = await api.get("/reportes/ventas-recientes", { params });

      setVentas(normalizarLista(response.data, "ventas"));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las ventas.");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarVentas(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
    cargarVentas(filtrosIniciales);
  };

  const ventasFiltradas = useMemo(() => {
    let lista = [...ventas];

    if (filtros.buscar) {
      const texto = normalizar(filtros.buscar);

      lista = lista.filter((venta) => {
        return (
          String(venta.id_venta).includes(texto) ||
          normalizar(venta.cliente).includes(texto) ||
          normalizar(venta.vendedor).includes(texto) ||
          normalizar(venta.sede).includes(texto) ||
          normalizar(venta.metodo_pago).includes(texto)
        );
      });
    }

    if (filtros.metodo_pago) {
      lista = lista.filter(
        (venta) =>
          normalizar(venta.metodo_pago) === normalizar(filtros.metodo_pago)
      );
    }

    if (filtros.id_sede) {
      const sedeSeleccionada = sedes.find(
        (sede) => String(sede.id_sede) === String(filtros.id_sede)
      );

      if (sedeSeleccionada) {
        const nombreSede =
          sedeSeleccionada.nombre ||
          sedeSeleccionada.nombre_comercial ||
          sedeSeleccionada.nombre_sede ||
          "";

        lista = lista.filter(
          (venta) => normalizar(venta.sede) === normalizar(nombreSede)
        );
      }
    }

    if (filtros.id_usuario) {
      const usuarioSeleccionado = usuarios.find(
        (item) => String(item.id_usuario) === String(filtros.id_usuario)
      );

      if (usuarioSeleccionado) {
        const nombreUsuario = `${usuarioSeleccionado.nombres ?? ""} ${
          usuarioSeleccionado.apellidos ?? ""
        }`;

        lista = lista.filter((venta) =>
          normalizar(venta.vendedor).includes(normalizar(nombreUsuario))
        );
      }
    }

    return lista;
  }, [ventas, filtros, sedes, usuarios]);

  const resumen = useMemo(() => {
    const totalVentas = ventasFiltradas.length;

    const ingresos = ventasFiltradas.reduce(
      (sum, venta) => sum + Number(venta.total ?? 0),
      0
    );

    const ticketPromedio = totalVentas > 0 ? ingresos / totalVentas : 0;

    const efectivo = ventasFiltradas
      .filter((venta) => normalizar(venta.metodo_pago) === "efectivo")
      .reduce((sum, venta) => sum + Number(venta.total ?? 0), 0);

    const yape = ventasFiltradas
      .filter((venta) => normalizar(venta.metodo_pago) === "yape")
      .reduce((sum, venta) => sum + Number(venta.total ?? 0), 0);

    const plin = ventasFiltradas
      .filter((venta) => normalizar(venta.metodo_pago) === "plin")
      .reduce((sum, venta) => sum + Number(venta.total ?? 0), 0);

    const tarjeta = ventasFiltradas
      .filter((venta) => normalizar(venta.metodo_pago) === "tarjeta")
      .reduce((sum, venta) => sum + Number(venta.total ?? 0), 0);

    return {
      totalVentas,
      ingresos,
      ticketPromedio,
      efectivo,
      yape,
      plin,
      tarjeta,
    };
  }, [ventasFiltradas]);

  const verDetalleVenta = async (idVenta) => {
    try {
      setCargandoDetalle(true);
      setError("");
      setModalDetalleAbierto(true);
      setDetalleVenta(null);

      const response = await api.get(`/reportes/ventas/${idVenta}/detalle`);
      setDetalleVenta(response.data);
    } catch (err) {
      console.error(err);
      setModalDetalleAbierto(false);
      setError("No se pudo cargar el detalle de la venta.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setDetalleVenta(null);
  };

  const exportarExcel = () => {
    if (ventasFiltradas.length === 0) {
      alert("No hay ventas para exportar.");
      return;
    }

    const filas = ventasFiltradas
      .map(
        (venta) => `
          <tr>
            <td>${venta.id_venta ?? ""}</td>
            <td>${venta.fecha_venta ?? ""}</td>
            <td>${venta.cliente ?? "Sin cliente"}</td>
            <td>${venta.vendedor ?? ""}</td>
            <td>${venta.sede ?? ""}</td>
            <td>${venta.metodo_pago ?? ""}</td>
            <td>${Number(venta.total ?? 0).toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    const contenido = `
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <h2>Reporte de ventas - Dulce Mora</h2>
          <p>Generado por: ${usuario?.nombres ?? "Administrador"}</p>
          <p>Total ventas: ${resumen.totalVentas}</p>
          <p>Ingresos: ${resumen.ingresos.toFixed(2)}</p>

          <table border="1">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Sede</th>
                <th>Método de pago</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${filas}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([contenido], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    const fecha = new Date().toISOString().slice(0, 10);

    enlace.href = url;
    enlace.download = `historial_ventas_${fecha}.xls`;
    enlace.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    cargarListas();
    cargarVentas(filtrosIniciales);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando historial de ventas...</h2>
          <p>Estamos obteniendo las ventas registradas.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Ventas / Historial</span>
          <h1>Historial de ventas</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres || "Admin"}</strong>. Aquí
            puedes consultar ventas por fecha, sede, vendedor y método de pago.
          </p>
        </div>

        <button className="refresh-button" onClick={() => cargarVentas(filtros)}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      <section className="historial-filtros-card">
        <div className="historial-filtros-head">
          <div>
            <h2>
              <FiFilter /> Filtros de búsqueda
            </h2>
            <p>Selecciona los filtros necesarios para consultar el historial.</p>
          </div>
        </div>

        <div className="historial-filtros-grid historial-filtros-grid-limpio">
          <label>
            Desde
            <input
              type="date"
              name="desde"
              value={filtros.desde}
              onChange={manejarCambioFiltro}
            />
          </label>

          <label>
            Hasta
            <input
              type="date"
              name="hasta"
              value={filtros.hasta}
              onChange={manejarCambioFiltro}
            />
          </label>

          <label>
            Sede
            <select
              name="id_sede"
              value={filtros.id_sede}
              onChange={manejarCambioFiltro}
            >
              <option value="">Todas las sedes</option>

              {sedes.map((sede) => (
                <option key={sede.id_sede} value={sede.id_sede}>
                  {sede.nombre ||
                    sede.nombre_comercial ||
                    sede.nombre_sede ||
                    "Sede"}
                </option>
              ))}
            </select>
          </label>

          <label>
            Vendedor
            <select
              name="id_usuario"
              value={filtros.id_usuario}
              onChange={manejarCambioFiltro}
            >
              <option value="">Todos los vendedores</option>

              {usuarios.map((item) => (
                <option key={item.id_usuario} value={item.id_usuario}>
                  {item.nombres} {item.apellidos}
                </option>
              ))}
            </select>
          </label>

          <label>
            Método de pago
            <select
              name="metodo_pago"
              value={filtros.metodo_pago}
              onChange={manejarCambioFiltro}
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </label>

          <label className="historial-filtro-buscar">
            Buscar
            <div className="historial-search-input">
              <FiSearch />
              <input
                type="text"
                name="buscar"
                value={filtros.buscar}
                onChange={manejarCambioFiltro}
                placeholder="Buscar por ID, sede, vendedor o método..."
              />
            </div>
          </label>
        </div>

        <div className="historial-filtros-actions">
          <button
            type="button"
            className="btn-historial-secundario"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>

          <button
            type="button"
            className="btn-historial-principal"
            onClick={aplicarFiltros}
          >
            Buscar ventas
          </button>

          <button
            type="button"
            className="btn-historial-excel"
            onClick={exportarExcel}
          >
            <FiDownload />
            Exportar Excel
          </button>
        </div>
      </section>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="historial-resumen-grid">
        <article className="historial-stat pink">
          <FiShoppingBag />
          <div>
            <span>Total ventas</span>
            <h3>{resumen.totalVentas}</h3>
          </div>
        </article>

        <article className="historial-stat green">
          <FiDollarSign />
          <div>
            <span>Ingresos</span>
            <h3>{formatoSoles(resumen.ingresos)}</h3>
          </div>
        </article>

        <article className="historial-stat purple">
          <FiTrendingUp />
          <div>
            <span>Ticket promedio</span>
            <h3>{formatoSoles(resumen.ticketPromedio)}</h3>
          </div>
        </article>

        <article className="historial-stat orange">
          <FiCalendar />
          <div>
            <span>Registros cargados</span>
            <h3>{ventasFiltradas.length}</h3>
          </div>
        </article>
      </section>

      <section className="historial-pagos-grid">
        <article>
          <span>Efectivo</span>
          <strong>{formatoSoles(resumen.efectivo)}</strong>
        </article>

        <article>
          <span>Yape</span>
          <strong>{formatoSoles(resumen.yape)}</strong>
        </article>

        <article>
          <span>Plin</span>
          <strong>{formatoSoles(resumen.plin)}</strong>
        </article>

        <article>
          <span>Tarjeta</span>
          <strong>{formatoSoles(resumen.tarjeta)}</strong>
        </article>
      </section>

      <section className="historial-table-card">
        <div className="historial-table-head">
          <div>
            <h2>Ventas encontradas</h2>
            <p>{ventasFiltradas.length} venta(s) según los filtros aplicados.</p>
          </div>
        </div>

        <div className="historial-table-wrapper">
          <table className="historial-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Sede</th>
                <th>Método</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-text">
                    No hay ventas para mostrar.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => (
                  <tr key={venta.id_venta}>
                    <td>#{venta.id_venta}</td>
                    <td>{venta.fecha_venta}</td>
                    <td>{venta.cliente || "Sin cliente"}</td>
                    <td>{venta.vendedor}</td>
                    <td>{venta.sede}</td>
                    <td>{venta.metodo_pago}</td>
                    <td>{formatoSoles(venta.total)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-ver-detalle"
                        onClick={() => verDetalleVenta(venta.id_venta)}
                      >
                        <FiEye />
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalDetalleAbierto && (
        <div className="historial-modal-overlay">
          <div className="historial-modal">
            <div className="historial-modal-head">
              <div>
                <span>Detalle de venta</span>
                <h2>
                  {detalleVenta?.venta
                    ? `Venta #${detalleVenta.venta.id_venta}`
                    : "Cargando..."}
                </h2>
              </div>

              <button type="button" onClick={cerrarDetalle}>
                <FiX />
              </button>
            </div>

            {cargandoDetalle ? (
              <div className="detalle-loading">Cargando detalle...</div>
            ) : (
              detalleVenta?.venta && (
                <>
                  <div className="historial-detalle-grid">
                    <div>
                      <span>Fecha</span>
                      <strong>{detalleVenta.venta.fecha_venta}</strong>
                    </div>

                    <div>
                      <span>Cliente</span>
                      <strong>
                        {detalleVenta.venta.cliente_nombres
                          ? `${detalleVenta.venta.cliente_nombres} ${
                              detalleVenta.venta.cliente_apellidos ?? ""
                            }`
                          : "Sin cliente"}
                      </strong>
                    </div>

                    <div>
                      <span>Vendedor</span>
                      <strong>
                        {detalleVenta.venta.vendedor_nombres}{" "}
                        {detalleVenta.venta.vendedor_apellidos}
                      </strong>
                    </div>

                    <div>
                      <span>Sede</span>
                      <strong>{detalleVenta.venta.sede_nombre}</strong>
                    </div>

                    <div>
                      <span>Método</span>
                      <strong>{detalleVenta.venta.metodo_pago}</strong>
                    </div>

                    <div>
                      <span>Total</span>
                      <strong>{formatoSoles(detalleVenta.venta.total)}</strong>
                    </div>
                  </div>

                  <h3 className="historial-detalle-title">
                    Productos vendidos
                  </h3>

                  <div className="historial-table-wrapper">
                    <table className="historial-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(detalleVenta.detalles || []).map((item) => (
                          <tr key={item.id_detalle_venta}>
                            <td>{item.nombre_producto}</td>
                            <td>{item.cantidad}</td>
                            <td>{formatoSoles(item.precio_unitario)}</td>
                            <td>{formatoSoles(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="historial-modal-actions">
                    <button type="button" onClick={cerrarDetalle}>
                      Cerrar
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default HistorialVentas;