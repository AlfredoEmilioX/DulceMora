import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiBox,
  FiRefreshCw,
  FiSearch,
  FiMapPin,
  FiAlertTriangle,
  FiEdit2,
  FiPlus,
  FiMinus,
  FiSliders,
  FiX,
  FiActivity,
} from "react-icons/fi";

function Inventario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [stock, setStock] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [sedeFiltro, setSedeFiltro] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [stockSeleccionado, setStockSeleccionado] = useState(null);

  const [formMovimiento, setFormMovimiento] = useState({
    tipo_movimiento: "entrada",
    cantidad: "",
    motivo: "",
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [stockRes, sedesRes, movimientosRes] = await Promise.all([
        api.get("/stock"),
        api.get("/sedes"),
        api.get("/movimientos-stock"),
      ]);

      setStock(stockRes.data || []);
      setSedes(sedesRes.data || []);
      setMovimientos(movimientosRes.data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const formatoFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stockFiltrado = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return stock.filter((item) => {
      const producto = String(item.producto?.nombre_producto || "").toLowerCase();
      const categoria = String(
        item.producto?.categoria?.nombre_categoria || ""
      ).toLowerCase();
      const sede = String(item.sede?.nombre_comercial || "").toLowerCase();

      const coincideTexto =
        !texto ||
        producto.includes(texto) ||
        categoria.includes(texto) ||
        sede.includes(texto);

      const coincideSede =
        !sedeFiltro || Number(item.id_sede) === Number(sedeFiltro);

      return coincideTexto && coincideSede;
    });
  }, [stock, busqueda, sedeFiltro]);

  const resumen = useMemo(() => {
    const totalRegistros = stock.length;

    const totalUnidades = stock.reduce((total, item) => {
      return total + Number(item.cantidad || 0);
    }, 0);

    const stockBajo = stock.filter((item) => {
      return Number(item.cantidad || 0) <= Number(item.stock_minimo || 0);
    }).length;

    const inactivos = stock.filter(
      (item) => item.estado === false || item.estado === 0
    ).length;

    return {
      totalRegistros,
      totalUnidades,
      stockBajo,
      inactivos,
    };
  }, [stock]);

  const obtenerEstadoStock = (item) => {
    const cantidad = Number(item.cantidad || 0);
    const minimo = Number(item.stock_minimo || 0);

    if (item.estado === false || item.estado === 0) {
      return {
        texto: "Inactivo",
        clase: "stock-badge-inactivo",
      };
    }

    if (cantidad <= minimo) {
      return {
        texto: "Stock bajo",
        clase: "stock-badge-bajo",
      };
    }

    return {
      texto: "Disponible",
      clase: "stock-badge-ok",
    };
  };

  const abrirMovimiento = (item, tipo = "entrada") => {
    setMensaje("");
    setError("");
    setStockSeleccionado(item);
    setFormMovimiento({
      tipo_movimiento: tipo,
      cantidad: "",
      motivo: "",
    });
    setModalMovimiento(true);
  };

  const cerrarMovimiento = () => {
    setModalMovimiento(false);
    setStockSeleccionado(null);
    setFormMovimiento({
      tipo_movimiento: "entrada",
      cantidad: "",
      motivo: "",
    });
  };

  const registrarMovimiento = async (e) => {
    e.preventDefault();

    if (!stockSeleccionado) {
      setError("No se seleccionó ningún stock.");
      return;
    }

    if (formMovimiento.cantidad === "" || Number(formMovimiento.cantidad) < 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    if (
      formMovimiento.tipo_movimiento !== "ajuste" &&
      Number(formMovimiento.cantidad) <= 0
    ) {
      setError("Para entrada o salida, la cantidad debe ser mayor a 0.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      await api.post("/movimientos-stock", {
        id_stock: stockSeleccionado.id_stock,
        id_usuario: usuario?.id_usuario || 1,
        tipo_movimiento: formMovimiento.tipo_movimiento,
        cantidad: Number(formMovimiento.cantidad),
        motivo: formMovimiento.motivo || null,
      });

      setMensaje("Movimiento registrado correctamente.");
      cerrarMovimiento();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo registrar el movimiento de stock."
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoStock = async (item) => {
    const activo = item.estado === true || item.estado === 1;
    const accion = activo ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} el stock de "${item.producto?.nombre_producto}" en "${item.sede?.nombre_comercial}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(`/stock/${item.id_stock}/cambiar-estado`);

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo cambiar el estado del stock."
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando inventario...</h2>
          <p>Estamos obteniendo el stock por sede.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Operaciones</span>
          <h1>Inventario</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            controlar el stock de productos por sede.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarDatos}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="inventario-summary">
        <article>
          <div className="inventario-summary-icon">
            <FiBox />
          </div>
          <div>
            <span>Registros de stock</span>
            <strong>{resumen.totalRegistros}</strong>
          </div>
        </article>

        <article>
          <div className="inventario-summary-icon">
            <FiActivity />
          </div>
          <div>
            <span>Unidades totales</span>
            <strong>{resumen.totalUnidades}</strong>
          </div>
        </article>

        <article>
          <div className="inventario-summary-icon warning">
            <FiAlertTriangle />
          </div>
          <div>
            <span>Stock bajo</span>
            <strong>{resumen.stockBajo}</strong>
          </div>
        </article>

        <article>
          <div className="inventario-summary-icon inactive">
            <FiX />
          </div>
          <div>
            <span>Inactivos</span>
            <strong>{resumen.inactivos}</strong>
          </div>
        </article>
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Stock por sede</h2>
            <span>{stockFiltrado.length} registro(s)</span>
          </div>
        </div>

        <div className="inventario-toolbar">
          <div className="search-box inventario-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por producto, categoría o sede..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="inventario-select"
            value={sedeFiltro}
            onChange={(e) => setSedeFiltro(e.target.value)}
          >
            <option value="">Todas las sedes</option>
            {sedes.map((sede) => (
              <option key={sede.id_sede} value={sede.id_sede}>
                {sede.nombre_comercial}
              </option>
            ))}
          </select>
        </div>

        {stockFiltrado.length === 0 ? (
          <p className="empty-text">No se encontraron registros de inventario.</p>
        ) : (
          <div className="inventario-table-wrap">
            <table className="inventario-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Sede</th>
                  <th>Cantidad</th>
                  <th>Stock mínimo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {stockFiltrado.map((item) => {
                  const estado = obtenerEstadoStock(item);
                  const activo = item.estado === true || item.estado === 1;

                  return (
                    <tr key={item.id_stock}>
                      <td>
                        <strong>{item.producto?.nombre_producto}</strong>
                      </td>

                      <td>
                        {item.producto?.categoria?.nombre_categoria ||
                          "Sin categoría"}
                      </td>

                      <td>
                        <span className="inventario-sede">
                          <FiMapPin />
                          {item.sede?.nombre_comercial}
                        </span>
                      </td>

                      <td>
                        <strong className="inventario-cantidad">
                          {item.cantidad}
                        </strong>
                      </td>

                      <td>{item.stock_minimo}</td>

                      <td>
                        <span className={estado.clase}>{estado.texto}</span>
                      </td>

                      <td>
                        <div className="inventario-actions">
                          <button
                            type="button"
                            className="inventario-btn entrada"
                            onClick={() => abrirMovimiento(item, "entrada")}
                          >
                            <FiPlus />
                            Entrada
                          </button>

                          <button
                            type="button"
                            className="inventario-btn salida"
                            onClick={() => abrirMovimiento(item, "salida")}
                          >
                            <FiMinus />
                            Salida
                          </button>

                          <button
                            type="button"
                            className="inventario-btn ajuste"
                            onClick={() => abrirMovimiento(item, "ajuste")}
                          >
                            <FiSliders />
                            Ajuste
                          </button>

                          <button
                            type="button"
                            className={activo ? "eliminar-btn" : "activar-btn"}
                            onClick={() => cambiarEstadoStock(item)}
                          >
                            {activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Últimos movimientos</h2>
            <span>{movimientos.length} movimiento(s)</span>
          </div>
        </div>

        {movimientos.length === 0 ? (
          <p className="empty-text">Todavía no hay movimientos registrados.</p>
        ) : (
          <div className="inventario-table-wrap">
            <table className="inventario-table movimientos-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Sede</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Anterior</th>
                  <th>Actual</th>
                  <th>Motivo</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.slice(0, 10).map((mov) => (
                  <tr key={mov.id_movimiento_stock}>
                    <td>{formatoFecha(mov.created_at)}</td>
                    <td>{mov.stock?.producto?.nombre_producto}</td>
                    <td>{mov.stock?.sede?.nombre_comercial}</td>
                    <td>
                      <span className={`movimiento-tipo ${mov.tipo_movimiento}`}>
                        {mov.tipo_movimiento}
                      </span>
                    </td>
                    <td>{mov.cantidad}</td>
                    <td>{mov.stock_anterior}</td>
                    <td>{mov.stock_actual}</td>
                    <td>{mov.motivo || "Sin motivo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalMovimiento && stockSeleccionado && (
        <div className="modal-overlay">
          <div className="cliente-modal inventario-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Movimiento de inventario</span>
                <h2>{stockSeleccionado.producto?.nombre_producto}</h2>
              </div>

              <button type="button" onClick={cerrarMovimiento}>
                <FiX />
              </button>
            </div>

            <div className="inventario-modal-info">
              <p>
                <strong>Sede:</strong>{" "}
                {stockSeleccionado.sede?.nombre_comercial}
              </p>
              <p>
                <strong>Stock actual:</strong> {stockSeleccionado.cantidad}
              </p>
              <p>
                <strong>Stock mínimo:</strong> {stockSeleccionado.stock_minimo}
              </p>
            </div>

            <form className="inventario-modal-form" onSubmit={registrarMovimiento}>
              <label>
                Tipo de movimiento
                <select
                  value={formMovimiento.tipo_movimiento}
                  onChange={(e) =>
                    setFormMovimiento({
                      ...formMovimiento,
                      tipo_movimiento: e.target.value,
                    })
                  }
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </label>

              <label>
                {formMovimiento.tipo_movimiento === "ajuste"
                  ? "Nuevo stock final"
                  : "Cantidad"}
                <input
                  type="number"
                  min="0"
                  placeholder={
                    formMovimiento.tipo_movimiento === "ajuste"
                      ? "Ej: 25"
                      : "Ej: 5"
                  }
                  value={formMovimiento.cantidad}
                  onChange={(e) =>
                    setFormMovimiento({
                      ...formMovimiento,
                      cantidad: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label className="inventario-modal-full">
                Motivo
                <textarea
                  placeholder="Ej: Reposición, venta manual, conteo físico..."
                  value={formMovimiento.motivo}
                  onChange={(e) =>
                    setFormMovimiento({
                      ...formMovimiento,
                      motivo: e.target.value,
                    })
                  }
                />
              </label>

              <div className="cliente-modal-actions inventario-modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarMovimiento}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Inventario;