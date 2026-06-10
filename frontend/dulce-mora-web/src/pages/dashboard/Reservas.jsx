import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiCalendar,
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiEye,
  FiTrash2,
  FiX,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";

function Reservas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalReserva, setModalReserva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [formReserva, setFormReserva] = useState({
    id_cliente: "",
    id_sede: "",
    fecha_reserva: new Date().toISOString().slice(0, 10),
    fecha_recojo: "",
    adelanto: 0,
    observacion: "",
  });

  const [detalleActual, setDetalleActual] = useState({
    id_producto: "",
    cantidad: "",
    precio_unitario: "",
  });

  const [detalles, setDetalles] = useState([]);

  const estadosReserva = ["pendiente", "confirmada", "atendida", "cancelada"];

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [reservasRes, clientesRes, sedesRes, productosRes] =
        await Promise.all([
          api.get("/reservas"),
          api.get("/clientes"),
          api.get("/sedes"),
          api.get("/productos"),
        ]);

      setReservas(reservasRes.data || []);
      setClientes(clientesRes.data || []);
      setSedes(sedesRes.data || []);
      setProductos(productosRes.data || []);
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message || "No se pudieron cargar las reservas."
        );
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

  const reservasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return reservas.filter((reserva) => {
      const cliente = obtenerNombreCliente(reserva.cliente).toLowerCase();
      const documento = String(
        reserva.cliente?.dni || reserva.cliente?.documento || ""
      ).toLowerCase();
      const sede = String(reserva.sede?.nombre_comercial || "").toLowerCase();
      const estado = String(reserva.estado_reserva || "").toLowerCase();

      const coincideTexto =
        !texto ||
        cliente.includes(texto) ||
        documento.includes(texto) ||
        sede.includes(texto) ||
        String(reserva.id_reserva).includes(texto);

      const coincideEstado = !estadoFiltro || estado === estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }, [reservas, busqueda, estadoFiltro]);

  const resumen = useMemo(() => {
    return {
      total: reservas.length,
      pendientes: reservas.filter((r) => r.estado_reserva === "pendiente")
        .length,
      confirmadas: reservas.filter((r) => r.estado_reserva === "confirmada")
        .length,
      atendidas: reservas.filter((r) => r.estado_reserva === "atendida").length,
      canceladas: reservas.filter((r) => r.estado_reserva === "cancelada")
        .length,
    };
  }, [reservas]);

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
    setFormReserva({
      id_cliente: "",
      id_sede: "",
      fecha_reserva: new Date().toISOString().slice(0, 10),
      fecha_recojo: "",
      adelanto: 0,
      observacion: "",
    });

    setDetalleActual({
      id_producto: "",
      cantidad: "",
      precio_unitario: "",
    });

    setDetalles([]);
  };

  const abrirNuevaReserva = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalReserva(true);
  };

  const cerrarNuevaReserva = () => {
    setModalReserva(false);
    limpiarFormulario();
  };

  const calcularSubtotalDetalles = () => {
    return detalles.reduce((total, item) => {
      return total + Number(item.cantidad) * Number(item.precio_unitario);
    }, 0);
  };

  const calcularSaldo = () => {
    const total = calcularSubtotalDetalles();
    const adelanto = Number(formReserva.adelanto || 0);
    const saldo = total - adelanto;

    return saldo < 0 ? 0 : saldo;
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
      setError("Ingresa un precio válido.");
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

  const registrarReserva = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formReserva.id_cliente) {
      setError("Selecciona un cliente.");
      return;
    }

    if (!formReserva.id_sede) {
      setError("Selecciona una sede.");
      return;
    }

    if (detalles.length === 0) {
      setError("Agrega al menos un producto a la reserva.");
      return;
    }

    const total = calcularSubtotalDetalles();
    const adelanto = Number(formReserva.adelanto || 0);

    if (adelanto > total) {
      setError("El adelanto no puede ser mayor al total.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        id_cliente: Number(formReserva.id_cliente),
        id_sede: Number(formReserva.id_sede),
        fecha_reserva: formReserva.fecha_reserva,
        fecha_recojo: formReserva.fecha_recojo || null,
        adelanto: adelanto,
        observacion: formReserva.observacion || null,
        detalles: detalles.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
        })),
      };

      await api.post("/reservas", payload);

      setMensaje("Reserva registrada correctamente.");
      cerrarNuevaReserva();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo registrar la reserva.");
        } else {
          setError(err.response.data.message || "No se pudo registrar la reserva.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoReserva = async (reserva, nuevoEstado) => {
    if (!nuevoEstado || nuevoEstado === reserva.estado_reserva) return;

    const confirmar = window.confirm(
      `¿Seguro que deseas cambiar la reserva #${reserva.id_reserva} a "${nuevoEstado}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(
        `/reservas/${reserva.id_reserva}/cambiar-estado`,
        {
          estado_reserva: nuevoEstado,
        }
      );

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

  const cancelarReserva = async (reserva) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas cancelar la reserva #${reserva.id_reserva}?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.delete(`/reservas/${reserva.id_reserva}`);

      setMensaje(response.data.message || "Reserva cancelada correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudo cancelar la reserva.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  const verDetalleReserva = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalDetalle(true);
  };

  const cerrarDetalleReserva = () => {
    setReservaSeleccionada(null);
    setModalDetalle(false);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando reservas...</h2>
          <p>Estamos obteniendo las reservas registradas.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Operaciones / reservas</span>
          <h1>Reservas</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            registrar reservas programadas para clientes.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarDatos}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="reservas-summary">
        <article>
          <div className="reservas-summary-icon">
            <FiCalendar />
          </div>
          <div>
            <span>Total reservas</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article>
          <div className="reservas-summary-icon pendiente">
            <FiFileText />
          </div>
          <div>
            <span>Pendientes</span>
            <strong>{resumen.pendientes}</strong>
          </div>
        </article>

        <article>
          <div className="reservas-summary-icon confirmada">
            <FiPackage />
          </div>
          <div>
            <span>Confirmadas</span>
            <strong>{resumen.confirmadas}</strong>
          </div>
        </article>

        <article>
          <div className="reservas-summary-icon atendida">
            <FiCreditCard />
          </div>
          <div>
            <span>Atendidas</span>
            <strong>{resumen.atendidas}</strong>
          </div>
        </article>
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Reservas registradas</h2>
            <span>{reservasFiltradas.length} reserva(s)</span>
          </div>

          <button className="nueva-reserva-btn" onClick={abrirNuevaReserva}>
            <FiPlus />
            Nueva reserva
          </button>
        </div>

        <div className="reservas-toolbar">
          <div className="search-box reservas-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por cliente, documento, sede o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="reservas-select"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estadosReserva.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {reservasFiltradas.length === 0 ? (
          <p className="empty-text">No se encontraron reservas registradas.</p>
        ) : (
          <div className="reservas-table-wrap">
            <table className="reservas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Sede</th>
                  <th>Fecha reserva</th>
                  <th>Fecha recojo</th>
                  <th>Total</th>
                  <th>Adelanto</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th>Cambiar estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {reservasFiltradas.map((reserva) => {
                  const saldo =
                    Number(reserva.total || 0) - Number(reserva.adelanto || 0);

                  return (
                    <tr key={reserva.id_reserva}>
                      <td>#{reserva.id_reserva}</td>

                      <td>
                        <strong>{obtenerNombreCliente(reserva.cliente)}</strong>
                      </td>

                      <td>
                        <span className="reserva-sede">
                          <FiMapPin />
                          {reserva.sede?.nombre_comercial}
                        </span>
                      </td>

                      <td>{formatoFecha(reserva.fecha_reserva)}</td>
                      <td>{formatoFecha(reserva.fecha_recojo)}</td>

                      <td>
                        <strong>{formatoSoles(reserva.total)}</strong>
                      </td>

                      <td>{formatoSoles(reserva.adelanto)}</td>

                      <td>
                        <strong>{formatoSoles(saldo)}</strong>
                      </td>

                      <td>
                        <span
                          className={`reserva-estado ${reserva.estado_reserva}`}
                        >
                          {reserva.estado_reserva || "pendiente"}
                        </span>
                      </td>

                      <td>
                        <select
                          className="reserva-estado-select"
                          value={reserva.estado_reserva || "pendiente"}
                          disabled={
                            reserva.estado_reserva === "atendida" ||
                            reserva.estado_reserva === "cancelada"
                          }
                          onChange={(e) =>
                            cambiarEstadoReserva(reserva, e.target.value)
                          }
                        >
                          {estadosReserva.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <div className="reservas-actions">
                          <button
                            type="button"
                            className="detalle-btn"
                            onClick={() => verDetalleReserva(reserva)}
                          >
                            <FiEye />
                            Ver
                          </button>

                          {reserva.estado_reserva !== "atendida" &&
                            reserva.estado_reserva !== "cancelada" && (
                              <button
                                type="button"
                                className="eliminar-btn"
                                onClick={() => cancelarReserva(reserva)}
                              >
                                <FiTrash2 />
                                Cancelar
                              </button>
                            )}
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

      {modalReserva && (
        <div className="modal-overlay">
          <div className="cliente-modal reserva-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Nueva reserva</span>
                <h2>Registrar reserva</h2>
              </div>

              <button type="button" onClick={cerrarNuevaReserva}>
                <FiX />
              </button>
            </div>

            <form className="reserva-form" onSubmit={registrarReserva}>
              <div className="reserva-form-grid">
                <label>
                  Cliente *
                  <select
                    value={formReserva.id_cliente}
                    onChange={(e) =>
                      setFormReserva({
                        ...formReserva,
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
                    value={formReserva.id_sede}
                    onChange={(e) =>
                      setFormReserva({
                        ...formReserva,
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
                  Fecha reserva *
                  <input
                    type="date"
                    value={formReserva.fecha_reserva}
                    onChange={(e) =>
                      setFormReserva({
                        ...formReserva,
                        fecha_reserva: e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Fecha recojo
                  <input
                    type="date"
                    value={formReserva.fecha_recojo}
                    onChange={(e) =>
                      setFormReserva({
                        ...formReserva,
                        fecha_recojo: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Adelanto
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formReserva.adelanto}
                    onChange={(e) =>
                      setFormReserva({
                        ...formReserva,
                        adelanto: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="reserva-detalle-box">
                <h3>Productos reservados</h3>

                <div className="reserva-detalle-form">
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
                    Todavía no agregaste productos a la reserva.
                  </p>
                ) : (
                  <div className="reserva-detalle-table-wrap">
                    <table className="reserva-detalle-table">
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

              <label className="reserva-observacion-label">
                Observación
                <textarea
                  placeholder="Ej: Reserva para cumpleaños, torta con nombre, decoración especial..."
                  value={formReserva.observacion}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      observacion: e.target.value,
                    })
                  }
                />
              </label>

              <div className="reserva-total-box">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatoSoles(calcularSubtotalDetalles())}</strong>
                </div>

                <div>
                  <span>Adelanto</span>
                  <strong>{formatoSoles(formReserva.adelanto)}</strong>
                </div>

                <div className="total-final">
                  <span>Saldo pendiente</span>
                  <strong>{formatoSoles(calcularSaldo())}</strong>
                </div>
              </div>

              <div className="cliente-modal-actions reserva-actions-modal">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarNuevaReserva}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar reserva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalle && reservaSeleccionada && (
        <div className="modal-overlay">
          <div className="cliente-modal reserva-detalle-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Detalle de reserva</span>
                <h2>Reserva #{reservaSeleccionada.id_reserva}</h2>
              </div>

              <button type="button" onClick={cerrarDetalleReserva}>
                <FiX />
              </button>
            </div>

            <div className="reserva-detalle-info">
              <article>
                <FiUser />
                <div>
                  <span>Cliente</span>
                  <strong>
                    {obtenerNombreCliente(reservaSeleccionada.cliente)}
                  </strong>
                </div>
              </article>

              <article>
                <FiMapPin />
                <div>
                  <span>Sede</span>
                  <strong>{reservaSeleccionada.sede?.nombre_comercial}</strong>
                </div>
              </article>

              <article>
                <FiCalendar />
                <div>
                  <span>Fecha recojo</span>
                  <strong>{formatoFecha(reservaSeleccionada.fecha_recojo)}</strong>
                </div>
              </article>

              <article>
                <FiCreditCard />
                <div>
                  <span>Adelanto</span>
                  <strong>{formatoSoles(reservaSeleccionada.adelanto)}</strong>
                </div>
              </article>

              <article>
                <FiFileText />
                <div>
                  <span>Estado</span>
                  <strong>{reservaSeleccionada.estado_reserva}</strong>
                </div>
              </article>
            </div>

            <div className="reserva-detalle-table-wrap">
              <table className="reserva-detalle-table">
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
                  {reservaSeleccionada.detalles?.map((detalle) => (
                    <tr key={detalle.id_detalle_reserva}>
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

            <div className="reserva-total-box detalle">
              <div>
                <span>Total</span>
                <strong>{formatoSoles(reservaSeleccionada.total)}</strong>
              </div>

              <div>
                <span>Adelanto</span>
                <strong>{formatoSoles(reservaSeleccionada.adelanto)}</strong>
              </div>

              <div className="total-final">
                <span>Saldo</span>
                <strong>
                  {formatoSoles(
                    Number(reservaSeleccionada.total || 0) -
                      Number(reservaSeleccionada.adelanto || 0)
                  )}
                </strong>
              </div>
            </div>

            {reservaSeleccionada.observacion && (
              <div className="reserva-observacion">
                <strong>Observación:</strong>
                <p>{reservaSeleccionada.observacion}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Reservas;