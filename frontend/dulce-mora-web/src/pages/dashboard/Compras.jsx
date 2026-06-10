import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiShoppingCart,
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiX,
  FiTrash2,
  FiEye,
  FiFileText,
  FiMapPin,
  FiUser,
  FiPackage,
} from "react-icons/fi";

function Compras() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalCompra, setModalCompra] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const [formCompra, setFormCompra] = useState({
    id_proveedor: "",
    id_sede: "",
    fecha_compra: new Date().toISOString().slice(0, 10),
    tipo_comprobante: "factura",
    serie: "",
    numero: "",
    observacion: "",
    igv: 0,
  });

  const [detalleActual, setDetalleActual] = useState({
    id_producto: "",
    cantidad: "",
    precio_unitario: "",
  });

  const [detalles, setDetalles] = useState([]);

  const cargarDatos = async () => {
  try {
    setLoading(true);
    setError("");

    const comprasRes = await api.get("/compras");
    console.log("Compras OK", comprasRes.data);

    const proveedoresRes = await api.get("/proveedores");
    console.log("Proveedores OK", proveedoresRes.data);

    const sedesRes = await api.get("/sedes");
    console.log("Sedes OK", sedesRes.data);

    const productosRes = await api.get("/productos");
    console.log("Productos OK", productosRes.data);

    setCompras(comprasRes.data || []);
    setProveedores(proveedoresRes.data || []);
    setSedes(sedesRes.data || []);
    setProductos(productosRes.data || []);
  } catch (err) {
    console.error("ERROR AL CARGAR COMPRAS:", err);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);

    setError(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "No se pudieron cargar las compras."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    cargarDatos();
  }, []);

  const proveedoresActivos = useMemo(() => {
    return proveedores.filter(
      (proveedor) => proveedor.estado === true || proveedor.estado === 1
    );
  }, [proveedores]);

  const productosActivos = useMemo(() => {
    return productos.filter(
      (producto) => producto.estado === true || producto.estado === 1
    );
  }, [productos]);

  const comprasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return compras;

    return compras.filter((compra) => {
      const proveedor = String(compra.proveedor?.razon_social || "").toLowerCase();
      const sede = String(compra.sede?.nombre_comercial || "").toLowerCase();
      const comprobante = `${compra.tipo_comprobante || ""} ${
        compra.serie || ""
      }-${compra.numero || ""}`.toLowerCase();

      return (
        proveedor.includes(texto) ||
        sede.includes(texto) ||
        comprobante.includes(texto) ||
        String(compra.id_compra).includes(texto)
      );
    });
  }, [compras, busqueda]);

  const formatoSoles = (monto) => {
    return `S/ ${Number(monto || 0).toFixed(2)}`;
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const limpiarFormulario = () => {
    setFormCompra({
      id_proveedor: "",
      id_sede: "",
      fecha_compra: new Date().toISOString().slice(0, 10),
      tipo_comprobante: "factura",
      serie: "",
      numero: "",
      observacion: "",
      igv: 0,
    });

    setDetalleActual({
      id_producto: "",
      cantidad: "",
      precio_unitario: "",
    });

    setDetalles([]);
  };

  const abrirNuevaCompra = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalCompra(true);
  };

  const cerrarNuevaCompra = () => {
    setModalCompra(false);
    limpiarFormulario();
  };

  const calcularSubtotalDetalles = () => {
    return detalles.reduce((total, item) => {
      return total + Number(item.cantidad) * Number(item.precio_unitario);
    }, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotalDetalles() + Number(formCompra.igv || 0);
  };

  const agregarDetalle = () => {
    setError("");

    if (!detalleActual.id_producto) {
      setError("Selecciona un producto.");
      return;
    }

    if (!detalleActual.cantidad || Number(detalleActual.cantidad) <= 0) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    if (
      detalleActual.precio_unitario === "" ||
      Number(detalleActual.precio_unitario) < 0
    ) {
      setError("Ingresa un precio unitario válido.");
      return;
    }

    const producto = productos.find(
      (item) => Number(item.id_producto) === Number(detalleActual.id_producto)
    );

    if (!producto) {
      setError("Producto no encontrado.");
      return;
    }

    const yaExiste = detalles.find(
      (item) => Number(item.id_producto) === Number(detalleActual.id_producto)
    );

    if (yaExiste) {
      setDetalles((prev) =>
        prev.map((item) =>
          Number(item.id_producto) === Number(detalleActual.id_producto)
            ? {
                ...item,
                cantidad: Number(item.cantidad) + Number(detalleActual.cantidad),
                precio_unitario: Number(detalleActual.precio_unitario),
              }
            : item
        )
      );
    } else {
      setDetalles((prev) => [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre_producto: producto.nombre_producto,
          categoria: producto.categoria?.nombre_categoria || "Sin categoría",
          cantidad: Number(detalleActual.cantidad),
          precio_unitario: Number(detalleActual.precio_unitario),
        },
      ]);
    }

    setDetalleActual({
      id_producto: "",
      cantidad: "",
      precio_unitario: "",
    });
  };

  const quitarDetalle = (idProducto) => {
    setDetalles((prev) =>
      prev.filter((item) => Number(item.id_producto) !== Number(idProducto))
    );
  };

  const registrarCompra = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formCompra.id_proveedor) {
      setError("Selecciona un proveedor.");
      return;
    }

    if (!formCompra.id_sede) {
      setError("Selecciona la sede destino.");
      return;
    }

    if (detalles.length === 0) {
      setError("Agrega al menos un producto a la compra.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        id_proveedor: Number(formCompra.id_proveedor),
        id_usuario: usuario?.id_usuario || 1,
        id_sede: Number(formCompra.id_sede),
        fecha_compra: formCompra.fecha_compra,
        tipo_comprobante: formCompra.tipo_comprobante || null,
        serie: formCompra.serie || null,
        numero: formCompra.numero || null,
        observacion: formCompra.observacion || null,
        igv: Number(formCompra.igv || 0),
        detalles: detalles.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
        })),
      };

      await api.post("/compras", payload);

      setMensaje("Compra registrada correctamente y stock actualizado.");
      cerrarNuevaCompra();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo registrar la compra.");
        } else {
          setError(err.response.data.message || "No se pudo registrar la compra.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const verDetalleCompra = (compra) => {
    setCompraSeleccionada(compra);
    setModalDetalle(true);
  };

  const cerrarDetalleCompra = () => {
    setCompraSeleccionada(null);
    setModalDetalle(false);
  };

  const anularCompra = async (compra) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas anular la compra #${compra.id_compra}? Esta acción intentará revertir el stock.`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.delete(`/compras/${compra.id_compra}`);

      setMensaje(response.data.message || "Compra anulada correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudo anular la compra.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando compras...</h2>
          <p>Estamos obteniendo el historial de compras.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Operaciones / compras</span>
          <h1>Compras</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            registrar compras a proveedores y actualizar stock por sede.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarDatos}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="compras-summary">
        <article>
          <div className="compras-summary-icon">
            <FiShoppingCart />
          </div>
          <div>
            <span>Total compras</span>
            <strong>{compras.length}</strong>
          </div>
        </article>

        <article>
          <div className="compras-summary-icon">
            <FiFileText />
          </div>
          <div>
            <span>Compras activas</span>
            <strong>
              {
                compras.filter((compra) => compra.estado_compra !== "anulada")
                  .length
              }
            </strong>
          </div>
        </article>

        <article>
          <div className="compras-summary-icon warning">
            <FiX />
          </div>
          <div>
            <span>Anuladas</span>
            <strong>
              {
                compras.filter((compra) => compra.estado_compra === "anulada")
                  .length
              }
            </strong>
          </div>
        </article>

        <article>
          <div className="compras-summary-icon money">
            <FiPackage />
          </div>
          <div>
            <span>Monto total</span>
            <strong>
              {formatoSoles(
                compras
                  .filter((compra) => compra.estado_compra !== "anulada")
                  .reduce((total, compra) => total + Number(compra.total || 0), 0)
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Compras registradas</h2>
            <span>{comprasFiltradas.length} compra(s)</span>
          </div>

          <button className="nueva-compra-btn" onClick={abrirNuevaCompra}>
            <FiPlus />
            Nueva compra
          </button>
        </div>

        <div className="compras-toolbar">
          <div className="search-box compras-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por proveedor, sede, comprobante o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {comprasFiltradas.length === 0 ? (
          <p className="empty-text">No se encontraron compras registradas.</p>
        ) : (
          <div className="compras-table-wrap">
            <table className="compras-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Sede</th>
                  <th>Comprobante</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {comprasFiltradas.map((compra) => (
                  <tr key={compra.id_compra}>
                    <td>#{compra.id_compra}</td>
                    <td>{formatoFecha(compra.fecha_compra)}</td>
                    <td>
                      <strong>{compra.proveedor?.razon_social}</strong>
                    </td>
                    <td>
                      <span className="compra-sede">
                        <FiMapPin />
                        {compra.sede?.nombre_comercial}
                      </span>
                    </td>
                    <td>
                      {compra.tipo_comprobante
                        ? `${compra.tipo_comprobante.toUpperCase()} ${
                            compra.serie || ""
                          }-${compra.numero || ""}`
                        : "Sin comprobante"}
                    </td>
                    <td>
                      <strong>{formatoSoles(compra.total)}</strong>
                    </td>
                    <td>
                      {compra.estado_compra === "anulada" ? (
                        <span className="compra-estado anulada">Anulada</span>
                      ) : (
                        <span className="compra-estado registrada">
                          Registrada
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="compras-actions">
                        <button
                          type="button"
                          className="detalle-btn"
                          onClick={() => verDetalleCompra(compra)}
                        >
                          <FiEye />
                          Ver
                        </button>

                        {compra.estado_compra !== "anulada" && (
                          <button
                            type="button"
                            className="eliminar-btn"
                            onClick={() => anularCompra(compra)}
                          >
                            <FiTrash2 />
                            Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalCompra && (
        <div className="modal-overlay">
          <div className="cliente-modal compra-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Nueva compra</span>
                <h2>Registrar compra a proveedor</h2>
              </div>

              <button type="button" onClick={cerrarNuevaCompra}>
                <FiX />
              </button>
            </div>

            <form className="compra-form" onSubmit={registrarCompra}>
              <div className="compra-form-grid">
                <label>
                  Proveedor *
                  <select
                    value={formCompra.id_proveedor}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        id_proveedor: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedoresActivos.map((proveedor) => (
                      <option
                        key={proveedor.id_proveedor}
                        value={proveedor.id_proveedor}
                      >
                        {proveedor.razon_social}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Sede destino *
                  <select
                    value={formCompra.id_sede}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        id_sede: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccionar sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id_sede} value={sede.id_sede}>
                        {sede.nombre_comercial}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Fecha de compra *
                  <input
                    type="date"
                    value={formCompra.fecha_compra}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        fecha_compra: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Tipo comprobante
                  <select
                    value={formCompra.tipo_comprobante}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        tipo_comprobante: e.target.value,
                      })
                    }
                  >
                    <option value="factura">Factura</option>
                    <option value="boleta">Boleta</option>
                    <option value="ticket">Ticket</option>
                    <option value="">Sin comprobante</option>
                  </select>
                </label>

                <label>
                  Serie
                  <input
                    type="text"
                    placeholder="Ej: F001"
                    value={formCompra.serie}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        serie: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Número
                  <input
                    type="text"
                    placeholder="Ej: 000123"
                    value={formCompra.numero}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        numero: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="compra-detalle-box">
                <h3>Productos de la compra</h3>

                <div className="compra-detalle-form">
                  <select
                    value={detalleActual.id_producto}
                    onChange={(e) =>
                      setDetalleActual({
                        ...detalleActual,
                        id_producto: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar producto</option>
                    {productosActivos.map((producto) => (
                      <option
                        key={producto.id_producto}
                        value={producto.id_producto}
                      >
                        {producto.nombre_producto}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={detalleActual.cantidad}
                    onChange={(e) =>
                      setDetalleActual({
                        ...detalleActual,
                        cantidad: e.target.value,
                      })
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Precio unitario"
                    value={detalleActual.precio_unitario}
                    onChange={(e) =>
                      setDetalleActual({
                        ...detalleActual,
                        precio_unitario: e.target.value,
                      })
                    }
                  />

                  <button type="button" onClick={agregarDetalle}>
                    <FiPlus />
                    Agregar
                  </button>
                </div>

                {detalles.length === 0 ? (
                  <p className="empty-text">
                    Todavía no agregaste productos a la compra.
                  </p>
                ) : (
                  <div className="compra-detalle-table-wrap">
                    <table className="compra-detalle-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Cant.</th>
                          <th>P. unit.</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {detalles.map((item) => (
                          <tr key={item.id_producto}>
                            <td>{item.nombre_producto}</td>
                            <td>{item.categoria}</td>
                            <td>{item.cantidad}</td>
                            <td>{formatoSoles(item.precio_unitario)}</td>
                            <td>
                              {formatoSoles(
                                Number(item.cantidad) *
                                  Number(item.precio_unitario)
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="mini-delete-btn"
                                onClick={() => quitarDetalle(item.id_producto)}
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="compra-form-grid">
                <label>
                  IGV
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formCompra.igv}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        igv: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="compra-full">
                  Observación
                  <textarea
                    placeholder="Ej: Compra de reposición para campaña..."
                    value={formCompra.observacion}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        observacion: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="compra-total-box">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatoSoles(calcularSubtotalDetalles())}</strong>
                </div>

                <div>
                  <span>IGV</span>
                  <strong>{formatoSoles(formCompra.igv)}</strong>
                </div>

                <div className="total-final">
                  <span>Total</span>
                  <strong>{formatoSoles(calcularTotal())}</strong>
                </div>
              </div>

              <div className="cliente-modal-actions compra-actions-modal">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarNuevaCompra}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar compra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalle && compraSeleccionada && (
        <div className="modal-overlay">
          <div className="cliente-modal compra-detalle-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Detalle de compra</span>
                <h2>Compra #{compraSeleccionada.id_compra}</h2>
              </div>

              <button type="button" onClick={cerrarDetalleCompra}>
                <FiX />
              </button>
            </div>

            <div className="compra-detalle-info">
              <article>
                <FiUser />
                <div>
                  <span>Proveedor</span>
                  <strong>{compraSeleccionada.proveedor?.razon_social}</strong>
                </div>
              </article>

              <article>
                <FiMapPin />
                <div>
                  <span>Sede destino</span>
                  <strong>{compraSeleccionada.sede?.nombre_comercial}</strong>
                </div>
              </article>

              <article>
                <FiFileText />
                <div>
                  <span>Comprobante</span>
                  <strong>
                    {compraSeleccionada.tipo_comprobante
                      ? `${compraSeleccionada.tipo_comprobante.toUpperCase()} ${
                          compraSeleccionada.serie || ""
                        }-${compraSeleccionada.numero || ""}`
                      : "Sin comprobante"}
                  </strong>
                </div>
              </article>
            </div>

            <div className="compra-detalle-table-wrap">
              <table className="compra-detalle-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>P. unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {compraSeleccionada.detalles?.map((detalle) => (
                    <tr key={detalle.id_detalle_compra}>
                      <td>{detalle.producto?.nombre_producto}</td>
                      <td>
                        {detalle.producto?.categoria?.nombre_categoria ||
                          "Sin categoría"}
                      </td>
                      <td>{detalle.cantidad}</td>
                      <td>{formatoSoles(detalle.precio_unitario)}</td>
                      <td>{formatoSoles(detalle.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="compra-total-box detalle">
              <div>
                <span>Subtotal</span>
                <strong>{formatoSoles(compraSeleccionada.subtotal)}</strong>
              </div>

              <div>
                <span>IGV</span>
                <strong>{formatoSoles(compraSeleccionada.igv)}</strong>
              </div>

              <div className="total-final">
                <span>Total</span>
                <strong>{formatoSoles(compraSeleccionada.total)}</strong>
              </div>
            </div>

            {compraSeleccionada.observacion && (
              <div className="compra-observacion">
                <strong>Observación:</strong>
                <p>{compraSeleccionada.observacion}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Compras;