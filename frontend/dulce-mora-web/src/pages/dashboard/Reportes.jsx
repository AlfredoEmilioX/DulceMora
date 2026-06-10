import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar,
  FiDollarSign,
  FiGift,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

function Reportes() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const filtrosIniciales = {
    periodo: "mes",
    desde: "",
    hasta: "",
    id_sede: "",
  };

  const [filtros, setFiltros] = useState(filtrosIniciales);

  const [resumen, setResumen] = useState(null);
  const [ventasPorSede, setVentasPorSede] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [pagosPorMetodo, setPagosPorMetodo] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [cumpleanosMes, setCumpleanosMes] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatoSoles = (monto) => {
    return `S/ ${Number(monto ?? 0).toFixed(2)}`;
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

  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  const cargarSedes = async () => {
    try {
      const response = await api.get("/sedes");
      setSedes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarResumen = async (filtrosActuales = filtros) => {
    try {
      setLoading(true);
      setError("");

      const params = construirParams(filtrosActuales);

      const [
        resumenRes,
        ventasSedeRes,
        productosRes,
        pagosRes,
        ventasRecientesRes,
        cumpleanosRes,
        stockBajoRes,
      ] = await Promise.all([
        api.get("/reportes/resumen", { params }),
        api.get("/reportes/ventas-por-sede", { params }),
        api.get("/reportes/productos-mas-vendidos", { params }),
        api.get("/reportes/pagos-por-metodo", { params }),
        api.get("/reportes/ventas-recientes", { params }),
        api.get("/reportes/cumpleanos-mes", { params }),
        api.get("/reportes/stock-bajo", { params }),
      ]);

      setResumen(resumenRes.data || {});
      setVentasPorSede(Array.isArray(ventasSedeRes.data) ? ventasSedeRes.data : []);
      setProductosMasVendidos(
        Array.isArray(productosRes.data) ? productosRes.data : []
      );
      setPagosPorMetodo(Array.isArray(pagosRes.data) ? pagosRes.data : []);
      setVentasRecientes(
        Array.isArray(ventasRecientesRes.data) ? ventasRecientesRes.data : []
      );
      setCumpleanosMes(Array.isArray(cumpleanosRes.data) ? cumpleanosRes.data : []);
      setStockBajo(Array.isArray(stockBajoRes.data) ? stockBajoRes.data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el resumen general.");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarResumen(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
    cargarResumen(filtrosIniciales);
  };

  const ticketPromedio = useMemo(() => {
    const ingresos = Number(resumen?.ingresos_totales ?? 0);
    const ventas = Number(resumen?.total_ventas ?? 0);

    if (ventas <= 0) return 0;

    return ingresos / ventas;
  }, [resumen]);

  const ventasUltimosDias = useMemo(() => {
    const lista = [...ventasRecientes].slice(0, 7).reverse();

    const maximo = Math.max(...lista.map((venta) => Number(venta.total ?? 0)), 1);

    return lista.map((venta) => ({
      id: venta.id_venta,
      fecha: venta.fecha_venta
        ? new Date(venta.fecha_venta).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
          })
        : "Sin fecha",
      total: Number(venta.total ?? 0),
      porcentaje: Math.max((Number(venta.total ?? 0) / maximo) * 100, 8),
    }));
  }, [ventasRecientes]);

  const topProductos = useMemo(() => {
    return [...productosMasVendidos]
      .sort(
        (a, b) =>
          Number(b.total_vendido ?? b.cantidad_vendida ?? 0) -
          Number(a.total_vendido ?? a.cantidad_vendida ?? 0)
      )
      .slice(0, 5);
  }, [productosMasVendidos]);

  const topSedes = useMemo(() => {
    return [...ventasPorSede]
      .sort(
        (a, b) =>
          Number(b.ingresos_totales ?? 0) - Number(a.ingresos_totales ?? 0)
      )
      .slice(0, 5);
  }, [ventasPorSede]);

  const maxSede = useMemo(() => {
    return Math.max(...topSedes.map((item) => Number(item.ingresos_totales ?? 0)), 1);
  }, [topSedes]);

  const maxProducto = useMemo(() => {
    return Math.max(
      ...topProductos.map((item) =>
        Number(item.total_vendido ?? item.cantidad_vendida ?? 0)
      ),
      1
    );
  }, [topProductos]);

  const maxPago = useMemo(() => {
    return Math.max(
      ...pagosPorMetodo.map((item) => Number(item.total_recaudado ?? 0)),
      1
    );
  }, [pagosPorMetodo]);

  const productoEstrella = topProductos[0];
  const sedeLider = topSedes[0];

  const metodoMasUsado = useMemo(() => {
    if (pagosPorMetodo.length === 0) return null;

    return [...pagosPorMetodo].sort(
      (a, b) => Number(b.total_pagos ?? 0) - Number(a.total_pagos ?? 0)
    )[0];
  }, [pagosPorMetodo]);

  const estadoNegocio = useMemo(() => {
    const ventas = Number(resumen?.total_ventas ?? 0);
    const stock = Number(resumen?.productos_stock_bajo ?? 0);

    if (ventas >= 20 && stock === 0) {
      return {
        texto: "Buen movimiento",
        descripcion: "Las ventas se mantienen activas y no hay alertas críticas de stock.",
        clase: "positivo",
      };
    }

    if (ventas >= 10 && stock <= 3) {
      return {
        texto: "Movimiento estable",
        descripcion: "El negocio tiene actividad, pero conviene revisar productos y sedes.",
        clase: "medio",
      };
    }

    return {
      texto: "Requiere atención",
      descripcion: "Se recomienda revisar ventas, promociones, stock o atención por sede.",
      clase: "alerta",
    };
  }, [resumen]);

  useEffect(() => {
    cargarSedes();
    cargarResumen(filtrosIniciales);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando resumen general...</h2>
          <p>Estamos obteniendo los indicadores principales de Dulce Mora.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Resumen general</span>
          <h1>Resumen del negocio</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes ver
            cómo va Dulce Mora para tomar decisiones rápidas.
          </p>
        </div>

        <button className="refresh-button" onClick={() => cargarResumen(filtros)}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      <section className="resumen-filtros-card">
        <div>
          <h2>Filtros generales</h2>
          <p>Estos filtros afectan solo al resumen general del negocio.</p>
        </div>

        <div className="resumen-filtros-grid">
          <label>
            Periodo
            <select
              name="periodo"
              value={filtros.periodo}
              onChange={manejarCambioFiltro}
            >
              <option value="">Todos</option>
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="mes_anterior">Mes anterior</option>
              <option value="anio">Este año</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </label>

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
                  {sede.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="resumen-filtros-actions">
          <button type="button" className="btn-filtro-secundario" onClick={limpiarFiltros}>
            Limpiar
          </button>

          <button type="button" className="btn-filtro-principal" onClick={aplicarFiltros}>
            Generar resumen
          </button>
        </div>
      </section>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="resumen-kpi-grid">
        <article className="resumen-kpi pink">
          <div className="kpi-icon">
            <FiDollarSign />
          </div>
          <div>
            <span>Ingresos</span>
            <h3>{formatoSoles(resumen?.ingresos_totales)}</h3>
            <small>Recaudación del periodo</small>
          </div>
        </article>

        <article className="resumen-kpi purple">
          <div className="kpi-icon">
            <FiBarChart2 />
          </div>
          <div>
            <span>Ventas</span>
            <h3>{resumen?.total_ventas ?? 0}</h3>
            <small>Ventas registradas</small>
          </div>
        </article>

        <article className="resumen-kpi green">
          <div className="kpi-icon">
            <FiShoppingBag />
          </div>
          <div>
            <span>Ticket promedio</span>
            <h3>{formatoSoles(ticketPromedio)}</h3>
            <small>Promedio por venta</small>
          </div>
        </article>

        <article className="resumen-kpi yellow">
          <div className="kpi-icon">
            <FiPackage />
          </div>
          <div>
            <span>Productos</span>
            <h3>{resumen?.total_productos ?? 0}</h3>
            <small>Productos registrados</small>
          </div>
        </article>

        <article className="resumen-kpi blue">
          <div className="kpi-icon">
            <FiUsers />
          </div>
          <div>
            <span>Clientes</span>
            <h3>{resumen?.total_clientes ?? 0}</h3>
            <small>Clientes registrados</small>
          </div>
        </article>

        <article className="resumen-kpi orange">
          <div className="kpi-icon">
            <FiAlertTriangle />
          </div>
          <div>
            <span>Stock bajo</span>
            <h3>{resumen?.productos_stock_bajo ?? 0}</h3>
            <small>Productos por reponer</small>
          </div>
        </article>
      </section>

      <section className="resumen-decision-card">
        <div>
          <span className={`estado-negocio ${estadoNegocio.clase}`}>
            {estadoNegocio.texto}
          </span>
          <h2>Lectura rápida del negocio</h2>
          <p>{estadoNegocio.descripcion}</p>
        </div>

        <div className="decision-grid">
          <div>
            <small>Producto más vendido</small>
            <strong>{productoEstrella?.nombre_producto || "Sin datos"}</strong>
          </div>

          <div>
            <small>Sede con más ingresos</small>
            <strong>{sedeLider?.sede || "Sin datos"}</strong>
          </div>

          <div>
            <small>Método más usado</small>
            <strong>{metodoMasUsado?.metodo_pago || "Sin datos"}</strong>
          </div>
        </div>
      </section>

      <section className="resumen-grid-principal">
        <article className="resumen-card grande">
          <div className="resumen-card-head">
            <div>
              <h2>Ventas recientes</h2>
              <p>Últimos movimientos para ver si el negocio sube o baja.</p>
            </div>
            <FiTrendingUp />
          </div>

          <div className="grafico-barras">
            {ventasUltimosDias.length === 0 ? (
              <p className="empty-text">No hay ventas suficientes para graficar.</p>
            ) : (
              ventasUltimosDias.map((venta) => (
                <div className="barra-row" key={venta.id}>
                  <span>{venta.fecha}</span>
                  <div className="barra-track">
                    <div
                      className="barra-fill"
                      style={{ width: `${venta.porcentaje}%` }}
                    />
                  </div>
                  <strong>{formatoSoles(venta.total)}</strong>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="resumen-card">
          <div className="resumen-card-head">
            <div>
              <h2>Alertas rápidas</h2>
              <p>Aspectos que conviene revisar.</p>
            </div>
            <FiAlertTriangle />
          </div>

          <div className="alertas-list">
            <div className="alerta-item orange">
              <FiAlertTriangle />
              <div>
                <strong>{stockBajo.length}</strong>
                <span>Productos con stock bajo</span>
              </div>
            </div>

            <div className="alerta-item pink">
              <FiGift />
              <div>
                <strong>{cumpleanosMes.length}</strong>
                <span>Cumpleaños del mes</span>
              </div>
            </div>

            <div className="alerta-item blue">
              <FiMapPin />
              <div>
                <strong>{resumen?.total_sedes ?? 0}</strong>
                <span>Sedes en operación</span>
              </div>
            </div>

            <div className="alerta-item green">
              <FiCalendar />
              <div>
                <strong>{ventasRecientes.length}</strong>
                <span>Últimas ventas cargadas</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="resumen-grid-secundario">
        <article className="resumen-card">
          <div className="resumen-card-head">
            <div>
              <h2>Top 5 productos</h2>
              <p>Productos que más salida tienen.</p>
            </div>
            <FiPackage />
          </div>

          <div className="ranking-list">
            {topProductos.length === 0 ? (
              <p className="empty-text">No hay productos vendidos para mostrar.</p>
            ) : (
              topProductos.map((producto, index) => {
                const cantidad = Number(
                  producto.total_vendido ?? producto.cantidad_vendida ?? 0
                );
                const porcentaje = Math.max((cantidad / maxProducto) * 100, 8);

                return (
                  <div className="ranking-item" key={producto.id_producto || index}>
                    <div className="ranking-info">
                      <strong>
                        #{index + 1} {producto.nombre_producto}
                      </strong>
                      <span>{cantidad} unidades vendidas</span>
                    </div>

                    <div className="ranking-track">
                      <div
                        className="ranking-fill pink"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>

                    <b>{formatoSoles(producto.total_generado)}</b>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="resumen-card">
          <div className="resumen-card-head">
            <div>
              <h2>Ventas por sede</h2>
              <p>Locales con mayor movimiento.</p>
            </div>
            <FiMapPin />
          </div>

          <div className="ranking-list">
            {topSedes.length === 0 ? (
              <p className="empty-text">No hay ventas por sede para mostrar.</p>
            ) : (
              topSedes.map((sede, index) => {
                const ingresos = Number(sede.ingresos_totales ?? 0);
                const porcentaje = Math.max((ingresos / maxSede) * 100, 8);

                return (
                  <div className="ranking-item" key={sede.id_sede || sede.sede}>
                    <div className="ranking-info">
                      <strong>
                        #{index + 1} {sede.sede}
                      </strong>
                      <span>{sede.total_ventas} ventas</span>
                    </div>

                    <div className="ranking-track">
                      <div
                        className="ranking-fill purple"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>

                    <b>{formatoSoles(sede.ingresos_totales)}</b>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="resumen-grid-secundario">
        <article className="resumen-card">
          <div className="resumen-card-head">
            <div>
              <h2>Métodos de pago</h2>
              <p>Cómo están pagando los clientes.</p>
            </div>
            <FiDollarSign />
          </div>

          <div className="ranking-list">
            {pagosPorMetodo.length === 0 ? (
              <p className="empty-text">No hay pagos para mostrar.</p>
            ) : (
              pagosPorMetodo.map((pago) => {
                const total = Number(pago.total_recaudado ?? 0);
                const porcentaje = Math.max((total / maxPago) * 100, 8);

                return (
                  <div className="ranking-item" key={pago.metodo_pago}>
                    <div className="ranking-info">
                      <strong>{pago.metodo_pago}</strong>
                      <span>{pago.total_pagos} pagos</span>
                    </div>

                    <div className="ranking-track">
                      <div
                        className="ranking-fill green"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>

                    <b>{formatoSoles(pago.total_recaudado)}</b>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="resumen-card">
          <div className="resumen-card-head">
            <div>
              <h2>Últimas ventas</h2>
              <p>Resumen rápido de las ventas recientes.</p>
            </div>
            <FiBarChart2 />
          </div>

          <div className="ventas-mini-list">
            {ventasRecientes.length === 0 ? (
              <p className="empty-text">No hay ventas recientes.</p>
            ) : (
              ventasRecientes.slice(0, 5).map((venta) => (
                <div className="venta-mini" key={venta.id_venta}>
                  <div>
                    <strong>#{venta.id_venta} {venta.cliente || "Sin cliente"}</strong>
                    <span>{venta.sede} · {venta.metodo_pago}</span>
                  </div>

                  <b>{formatoSoles(venta.total)}</b>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </>
  );
}

export default Reportes;