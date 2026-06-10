import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiTruck,
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiEye,
  FiTrash2,
  FiX,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";

function Pedidos() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalPedido, setModalPedido] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const [formPedido, setFormPedido] = useState({
    id_cliente: "",
    id_sede: "",
    fecha_pedido: new Date().toISOString().slice(0, 10),
    fecha_entrega: "",
    tipo_entrega: "recojo",
    direccion_entrega: "",
    referencia: "",
    costo_envio: 0,
    descuento: 0,
    metodo_pago: "efectivo",
    observacion: "",
  });

  const [detalleActual, setDetalleActual] = useState({
    id_producto: "",
    cantidad: "",
    precio_unitario: "",
  });

  const [detalles, setDetalles] = useState([]);

  const estadosPedido = [
    "pendiente",
    "confirmado",
    "en_preparacion",
    "listo",
    "entregado",
    "cancelado",
  ];

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [pedidosRes, clientesRes, sedesRes, productosRes] =
        await Promise.all([
          api.get("/pedidos"),
          api.get("/clientes"),
          api.get("/sedes"),
          api.get("/productos"),
        ]);

      setPedidos(pedidosRes.data || []);
      setClientes(clientesRes.data || []);
      setSedes(sedesRes.data || []);
      setProductos(productosRes.data || []);
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudieron cargar los pedidos.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosActivos = useMemo(() => {
    return productos.filter(
      (producto) => producto.estado === true || producto.estado === 1
    );
  }, [productos]);

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const cliente = String(
        pedido.cliente?.nombre_completo ||
          pedido.cliente?.nombres ||
          pedido.cliente?.nombre ||
          ""
      ).toLowerCase();

      const documento = String(
        pedido.cliente?.dni || pedido.cliente?.documento || ""
      ).toLowerCase();

      const sede = String(pedido.sede?.nombre_comercial || "").toLowerCase();
      const estado = String(pedido.estado_pedido || "").toLowerCase();

      const coincideTexto =
        !texto ||
        cliente.includes(texto) ||
        documento.includes(texto) ||
        sede.includes(texto) ||
        String(pedido.id_pedido).includes(texto);

      const coincideEstado = !estadoFiltro || estado === estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }, [pedidos, busqueda, estadoFiltro]);

  const resumen = useMemo(() => {
    return {
      total: pedidos.length,
      pendientes: pedidos.filter((p) => p.estado_pedido === "pendiente").length,
      proceso: pedidos.filter((p) =>
        ["confirmado", "en_preparacion", "listo"].includes(p.estado_pedido)
      ).length,
      entregados: pedidos.filter((p) => p.estado_pedido === "entregado").length,
      cancelados: pedidos.filter((p) => p.estado_pedido === "cancelado").length,
    };
  }, [pedidos]);

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

  const obtenerNombreCliente = (cliente) => {
    if (!cliente) return "Sin cliente";

    return (
      cliente.nombre_completo ||
      cliente.nombres ||
      cliente.nombre ||
      `${cliente.nombre_cliente || ""} ${cliente.apellido_cliente || ""}`.trim() ||
      "Cliente"
    );
  };

  const limpiarFormulario = () => {
    setFormPedido({
      id_cliente: "",
      id_sede: "",
      fecha_pedido: new Date().toISOString().slice(0, 10),
      fecha_entrega: "",
      tipo_entrega: "recojo",
      direccion_entrega: "",
      referencia: "",
      costo_envio: 0,
      descuento: 0,
      metodo_pago: "efectivo",
      observacion: "",
    });

    setDetalleActual({
      id_producto: "",
      cantidad: "",
      precio_unitario: "",
    });

    setDetalles([]);
  };

  const abrirNuevoPedido = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalPedido(true);
  };

  const cerrarNuevoPedido = () => {
    setModalPedido(false);
    limpiarFormulario();
  };

  const calcularSubtotalDetalles = () => {
    return detalles.reduce((total, item) => {
      return total + Number(item.cantidad) * Number(item.precio_unitario);
    }, 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotalDetalles();
    const envio = Number(formPedido.costo_envio || 0);
    const descuento = Number(formPedido.descuento || 0);
    const total = subtotal + envio - descuento;

    return total < 0 ? 0 : total;
  };

  const seleccionarProducto = (idProducto) => {
    const producto = productos.find(
      (item) => Number(item.id_producto) === Number(idProducto)
    );

    setDetalleActual({
      ...detalleActual,
      id_producto: idProducto,
      precio_unitario: producto?.precio || "",
    });
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

  const registrarPedido = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formPedido.id_cliente) {
      setError("Selecciona un cliente.");
      return;
    }

    if (!formPedido.id_sede) {
      setError("Selecciona una sede.");
      return;
    }

    if (formPedido.tipo_entrega === "delivery" && !formPedido.direccion_entrega) {
      setError("La dirección de entrega es obligatoria para delivery.");
      return;
    }

    if (detalles.length === 0) {
      setError("Agrega al menos un producto al pedido.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        id_cliente: Number(formPedido.id_cliente),
        id_usuario: usuario?.id_usuario || 1,
        id_sede: Number(formPedido.id_sede),
        fecha_pedido: formPedido.fecha_pedido,
        fecha_entrega: formPedido.fecha_entrega || null,
        tipo_entrega: formPedido.tipo_entrega,
        direccion_entrega:
          formPedido.tipo_entrega === "delivery"
            ? formPedido.direccion_entrega
            : null,
        referencia:
          formPedido.tipo_entrega === "delivery"
            ? formPedido.referencia || null
            : null,
        costo_envio:
          formPedido.tipo_entrega === "delivery"
            ? Number(formPedido.costo_envio || 0)
            : 0,
        descuento: Number(formPedido.descuento || 0),
        metodo_pago: formPedido.metodo_pago || null,
        observacion: formPedido.observacion || null,
        detalles: detalles.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
        })),
      };

      await api.post("/pedidos", payload);

      setMensaje("Pedido registrado correctamente.");
      cerrarNuevoPedido();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo registrar el pedido.");
        } else {
          setError(err.response.data.message || "No se pudo registrar el pedido.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const verDetallePedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
  };

  const cerrarDetallePedido = () => {
    setPedidoSeleccionado(null);
    setModalDetalle(false);
  };

  const cambiarEstadoPedido = async (pedido, nuevoEstado) => {
    if (!nuevoEstado || nuevoEstado === pedido.estado_pedido) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas cambiar el pedido #${pedido.id_pedido} a "${nuevoEstado}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(`/pedidos/${pedido.id_pedido}/cambiar-estado`, {
        estado_pedido: nuevoEstado,
      });

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudo cambiar el estado.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  const cancelarPedido = async (pedido) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas cancelar el pedido #${pedido.id_pedido}?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.delete(`/pedidos/${pedido.id_pedido}`);

      setMensaje(response.data.message || "Pedido cancelado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudo cancelar el pedido.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando pedidos...</h2>
          <p>Estamos obteniendo los pedidos registrados.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Operaciones / pedidos</span>
          <h1>Pedidos</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            registrar pedidos para recojo o delivery.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarDatos}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="pedidos-summary">
        <article>
          <div className="pedidos-summary-icon">
            <FiTruck />
          </div>
          <div>
            <span>Total pedidos</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article>
          <div className="pedidos-summary-icon pendiente">
            <FiCalendar />
          </div>
          <div>
            <span>Pendientes</span>
            <strong>{resumen.pendientes}</strong>
          </div>
        </article>

        <article>
          <div className="pedidos-summary-icon proceso">
            <FiPackage />
          </div>
          <div>
            <span>En proceso</span>
            <strong>{resumen.proceso}</strong>
          </div>
        </article>

        <article>
          <div className="pedidos-summary-icon entregado">
            <FiCreditCard />
          </div>
          <div>
            <span>Entregados</span>
            <strong>{resumen.entregados}</strong>
          </div>
        </article>
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Pedidos registrados</h2>
            <span>{pedidosFiltrados.length} pedido(s)</span>
          </div>

          <button className="nuevo-pedido-btn" onClick={abrirNuevoPedido}>
            <FiPlus />
            Nuevo pedido
          </button>
        </div>

        <div className="pedidos-toolbar">
          <div className="search-box pedidos-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por cliente, documento, sede o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="pedidos-select"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estadosPedido.map((estado) => (
              <option key={estado} value={estado}>
                {estado.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="empty-text">No se encontraron pedidos registrados.</p>
        ) : (
          <div className="pedidos-table-wrap">
            <table className="pedidos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Sede</th>
                  <th>Entrega</th>
                  <th>Fecha entrega</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Cambiar estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id_pedido}>
                    <td>#{pedido.id_pedido}</td>

                    <td>
                      <strong>{obtenerNombreCliente(pedido.cliente)}</strong>
                    </td>

                    <td>
                      <span className="pedido-sede">
                        <FiMapPin />
                        {pedido.sede?.nombre_comercial}
                      </span>
                    </td>

                    <td>
                      <span className={`pedido-tipo ${pedido.tipo_entrega}`}>
                        {pedido.tipo_entrega}
                      </span>
                    </td>

                    <td>{formatoFecha(pedido.fecha_entrega)}</td>

                    <td>
                      <strong>{formatoSoles(pedido.total)}</strong>
                    </td>

                    <td>
                      <span className={`pedido-estado ${pedido.estado_pedido}`}>
                        {String(pedido.estado_pedido || "pendiente").replace(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td>
                      <select
                        className="pedido-estado-select"
                        value={pedido.estado_pedido || "pendiente"}
                        disabled={
                          pedido.estado_pedido === "entregado" ||
                          pedido.estado_pedido === "cancelado"
                        }
                        onChange={(e) => cambiarEstadoPedido(pedido, e.target.value)}
                      >
                        {estadosPedido.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <div className="pedidos-actions">
                        <button
                          type="button"
                          className="detalle-btn"
                          onClick={() => verDetallePedido(pedido)}
                        >
                          <FiEye />
                          Ver
                        </button>

                        {pedido.estado_pedido !== "entregado" &&
                          pedido.estado_pedido !== "cancelado" && (
                            <button
                              type="button"
                              className="eliminar-btn"
                              onClick={() => cancelarPedido(pedido)}
                            >
                              <FiTrash2 />
                              Cancelar
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

      {modalPedido && (
        <div className="modal-overlay">
          <div className="cliente-modal pedido-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Nuevo pedido</span>
                <h2>Registrar pedido</h2>
              </div>

              <button type="button" onClick={cerrarNuevoPedido}>
                <FiX />
              </button>
            </div>

            <form className="pedido-form" onSubmit={registrarPedido}>
              <div className="pedido-form-grid">
                <label>
                  Cliente *
                  <select
                    value={formPedido.id_cliente}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        id_cliente: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {obtenerNombreCliente(cliente)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Sede *
                  <select
                    value={formPedido.id_sede}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
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
                  Fecha pedido *
                  <input
                    type="date"
                    value={formPedido.fecha_pedido}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        fecha_pedido: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Fecha entrega
                  <input
                    type="date"
                    value={formPedido.fecha_entrega}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        fecha_entrega: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Tipo de entrega *
                  <select
                    value={formPedido.tipo_entrega}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        tipo_entrega: e.target.value,
                      })
                    }
                  >
                    <option value="recojo">Recojo en tienda</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </label>

                <label>
                  Método de pago
                  <select
                    value={formPedido.metodo_pago}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        metodo_pago: e.target.value,
                      })
                    }
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="">Pendiente</option>
                  </select>
                </label>

                {formPedido.tipo_entrega === "delivery" && (
                  <>
                    <label className="pedido-full">
                      Dirección de entrega *
                      <input
                        type="text"
                        placeholder="Ej: Jr. Lima 123, Huancayo"
                        value={formPedido.direccion_entrega}
                        onChange={(e) =>
                          setFormPedido({
                            ...formPedido,
                            direccion_entrega: e.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label className="pedido-full">
                      Referencia
                      <input
                        type="text"
                        placeholder="Ej: Casa color crema, segundo piso..."
                        value={formPedido.referencia}
                        onChange={(e) =>
                          setFormPedido({
                            ...formPedido,
                            referencia: e.target.value,
                          })
                        }
                      />
                    </label>
                  </>
                )}
              </div>

              <div className="pedido-detalle-box">
                <h3>Productos del pedido</h3>

                <div className="pedido-detalle-form">
                  <select
                    value={detalleActual.id_producto}
                    onChange={(e) => seleccionarProducto(e.target.value)}
                  >
                    <option value="">Seleccionar producto</option>
                    {productosActivos.map((producto) => (
                      <option key={producto.id_producto} value={producto.id_producto}>
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
                    placeholder="Precio"
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
                    Todavía no agregaste productos al pedido.
                  </p>
                ) : (
                  <div className="pedido-detalle-table-wrap">
                    <table className="pedido-detalle-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Cant.</th>
                          <th>Precio</th>
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

              <div className="pedido-form-grid">
                <label>
                  Costo envío
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPedido.costo_envio}
                    disabled={formPedido.tipo_entrega !== "delivery"}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        costo_envio: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Descuento
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPedido.descuento}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        descuento: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="pedido-full">
                  Observación
                  <textarea
                    placeholder="Ej: Pedido para cumpleaños, decorar con mensaje..."
                    value={formPedido.observacion}
                    onChange={(e) =>
                      setFormPedido({
                        ...formPedido,
                        observacion: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="pedido-total-box">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatoSoles(calcularSubtotalDetalles())}</strong>
                </div>

                <div>
                  <span>Envío</span>
                  <strong>{formatoSoles(formPedido.costo_envio)}</strong>
                </div>

                <div>
                  <span>Descuento</span>
                  <strong>{formatoSoles(formPedido.descuento)}</strong>
                </div>

                <div className="total-final">
                  <span>Total</span>
                  <strong>{formatoSoles(calcularTotal())}</strong>
                </div>
              </div>

              <div className="cliente-modal-actions pedido-actions-modal">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarNuevoPedido}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalle && pedidoSeleccionado && (
        <div className="modal-overlay">
          <div className="cliente-modal pedido-detalle-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Detalle de pedido</span>
                <h2>Pedido #{pedidoSeleccionado.id_pedido}</h2>
              </div>

              <button type="button" onClick={cerrarDetallePedido}>
                <FiX />
              </button>
            </div>

            <div className="pedido-detalle-info">
              <article>
                <FiUser />
                <div>
                  <span>Cliente</span>
                  <strong>{obtenerNombreCliente(pedidoSeleccionado.cliente)}</strong>
                </div>
              </article>

              <article>
                <FiMapPin />
                <div>
                  <span>Sede</span>
                  <strong>{pedidoSeleccionado.sede?.nombre_comercial}</strong>
                </div>
              </article>

              <article>
                <FiTruck />
                <div>
                  <span>Entrega</span>
                  <strong>{pedidoSeleccionado.tipo_entrega}</strong>
                </div>
              </article>

              <article>
                <FiCalendar />
                <div>
                  <span>Fecha entrega</span>
                  <strong>{formatoFecha(pedidoSeleccionado.fecha_entrega)}</strong>
                </div>
              </article>

              <article>
                <FiCreditCard />
                <div>
                  <span>Método pago</span>
                  <strong>{pedidoSeleccionado.metodo_pago || "Pendiente"}</strong>
                </div>
              </article>

              <article>
                <FiFileText />
                <div>
                  <span>Estado</span>
                  <strong>{pedidoSeleccionado.estado_pedido}</strong>
                </div>
              </article>
            </div>

            {pedidoSeleccionado.tipo_entrega === "delivery" && (
              <div className="pedido-delivery-box">
                <strong>Datos de delivery</strong>
                <p>
                  <b>Dirección:</b>{" "}
                  {pedidoSeleccionado.direccion_entrega || "No registrada"}
                </p>
                <p>
                  <b>Referencia:</b>{" "}
                  {pedidoSeleccionado.delivery?.referencia || "Sin referencia"}
                </p>
                <p>
                  <b>Estado delivery:</b>{" "}
                  {pedidoSeleccionado.delivery?.estado_delivery || "pendiente"}
                </p>
              </div>
            )}

            <div className="pedido-detalle-table-wrap">
              <table className="pedido-detalle-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidoSeleccionado.detalles?.map((detalle) => (
                    <tr key={detalle.id_detalle_pedido}>
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

            <div className="pedido-total-box detalle">
              <div>
                <span>Subtotal</span>
                <strong>{formatoSoles(pedidoSeleccionado.subtotal)}</strong>
              </div>

              <div>
                <span>Envío</span>
                <strong>{formatoSoles(pedidoSeleccionado.costo_envio)}</strong>
              </div>

              <div>
                <span>Descuento</span>
                <strong>{formatoSoles(pedidoSeleccionado.descuento)}</strong>
              </div>

              <div className="total-final">
                <span>Total</span>
                <strong>{formatoSoles(pedidoSeleccionado.total)}</strong>
              </div>
            </div>

            {pedidoSeleccionado.observacion && (
              <div className="pedido-observacion">
                <strong>Observación:</strong>
                <p>{pedidoSeleccionado.observacion}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Pedidos;