import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiGift,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiPackage,
  FiPercent,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

function Promociones() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);

  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [promocionSeleccionada, setPromocionSeleccionada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [formPromocion, setFormPromocion] = useState({
    nombre_promocion: "",
    descripcion: "",
    tipo_descuento: "porcentaje",
    valor_descuento: "",
    fecha_inicio: "",
    fecha_fin: "",
    monto_minimo: "",
    estado: true,
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [promocionesRes, productosRes] = await Promise.all([
        api.get("/promociones"),
        api.get("/productos"),
      ]);

      setPromociones(promocionesRes.data);
      setProductos(productosRes.data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las promociones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const promocionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return promociones;

    return promociones.filter((promocion) => {
      const nombre = String(promocion.nombre_promocion ?? "").toLowerCase();
      const descripcion = String(promocion.descripcion ?? "").toLowerCase();
      const tipo = String(promocion.tipo_descuento ?? "").toLowerCase();

      return (
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        tipo.includes(texto)
      );
    });
  }, [promociones, busqueda]);

  const productosActivos = useMemo(() => {
    return productos.filter(
      (producto) => producto.estado === true || producto.estado === 1
    );
  }, [productos]);

  const formatoSoles = (monto) => {
    return `S/ ${Number(monto ?? 0).toFixed(2)}`;
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const obtenerTextoDescuento = (promocion) => {
    if (promocion.tipo_descuento === "porcentaje") {
      return `${Number(promocion.valor_descuento).toFixed(0)}%`;
    }

    if (promocion.tipo_descuento === "monto_fijo") {
      return formatoSoles(promocion.valor_descuento);
    }

    if (promocion.tipo_descuento === "cumpleanos") {
      return `${Number(promocion.valor_descuento).toFixed(0)}% cumpleaños`;
    }

    return "Combo";
  };

  const obtenerIconoTipo = (tipo) => {
    if (tipo === "porcentaje") return <FiPercent />;
    if (tipo === "monto_fijo") return <FiDollarSign />;
    if (tipo === "cumpleanos") return <FiGift />;
    return <FiPackage />;
  };

  const limpiarFormulario = () => {
    setPromocionEditando(null);

    setFormPromocion({
      nombre_promocion: "",
      descripcion: "",
      tipo_descuento: "porcentaje",
      valor_descuento: "",
      fecha_inicio: "",
      fecha_fin: "",
      monto_minimo: "",
      estado: true,
    });
  };

  const abrirCrearPromocion = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalAbierto(true);
  };

  const abrirEditarPromocion = (promocion) => {
    setMensaje("");
    setError("");
    setPromocionEditando(promocion);

    setFormPromocion({
      nombre_promocion: promocion.nombre_promocion || "",
      descripcion: promocion.descripcion || "",
      tipo_descuento: promocion.tipo_descuento || "porcentaje",
      valor_descuento: promocion.valor_descuento || "",
      fecha_inicio: promocion.fecha_inicio
        ? String(promocion.fecha_inicio).substring(0, 10)
        : "",
      fecha_fin: promocion.fecha_fin
        ? String(promocion.fecha_fin).substring(0, 10)
        : "",
      monto_minimo: promocion.monto_minimo || "",
      estado: promocion.estado === true || promocion.estado === 1,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiarFormulario();
  };

  const guardarPromocion = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formPromocion.nombre_promocion.trim()) {
      setError("El nombre de la promoción es obligatorio.");
      return;
    }

    if (!formPromocion.fecha_inicio || !formPromocion.fecha_fin) {
      setError("Debes ingresar fecha de inicio y fecha de fin.");
      return;
    }

    if (!formPromocion.valor_descuento || Number(formPromocion.valor_descuento) < 0) {
      setError("El valor del descuento debe ser válido.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        nombre_promocion: formPromocion.nombre_promocion,
        descripcion: formPromocion.descripcion || null,
        tipo_descuento: formPromocion.tipo_descuento,
        valor_descuento: Number(formPromocion.valor_descuento),
        fecha_inicio: formPromocion.fecha_inicio,
        fecha_fin: formPromocion.fecha_fin,
        monto_minimo: formPromocion.monto_minimo
          ? Number(formPromocion.monto_minimo)
          : null,
        estado: formPromocion.estado,
      };

      if (promocionEditando) {
        await api.put(`/promociones/${promocionEditando.id_promocion}`, payload);
        setMensaje("Promoción actualizada correctamente.");
      } else {
        await api.post("/promociones", payload);
        setMensaje("Promoción registrada correctamente.");
      }

      cerrarModal();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo guardar la promoción.");
        } else {
          setError(
            err.response.data.message || "No se pudo guardar la promoción."
          );
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoPromocion = async (promocion) => {
    const accion = promocion.estado ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} la promoción "${promocion.nombre_promocion}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(
        `/promociones/${promocion.id_promocion}/cambiar-estado`
      );

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo cambiar el estado de la promoción."
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  const abrirGestionProductos = (promocion) => {
    setMensaje("");
    setError("");
    setPromocionSeleccionada(promocion);
    setProductoSeleccionado("");
    setModalProductosAbierto(true);
  };

  const cerrarGestionProductos = () => {
    setModalProductosAbierto(false);
    setPromocionSeleccionada(null);
    setProductoSeleccionado("");
  };

  const asignarProductoPromocion = async (e) => {
    e.preventDefault();

    if (!promocionSeleccionada || !productoSeleccionado) {
      setError("Selecciona un producto.");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      await api.post("/promociones-productos", {
        id_promocion: promocionSeleccionada.id_promocion,
        id_producto: Number(productoSeleccionado),
      });

      setMensaje("Producto agregado a la promoción.");
      setProductoSeleccionado("");

      await cargarDatos();

      const actualizada = promociones.find(
        (item) => item.id_promocion === promocionSeleccionada.id_promocion
      );

      if (actualizada) {
        setPromocionSeleccionada(actualizada);
      }
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo agregar el producto a la promoción."
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const quitarProductoPromocion = async (producto) => {
    const idRelacion = producto.pivot?.id_promocion_producto;

    if (!idRelacion) {
      setError("No se encontró la relación de la promoción con el producto.");
      return;
    }

    const confirmar = window.confirm(
      `¿Quitar "${producto.nombre_producto}" de esta promoción?`
    );

    if (!confirmar) return;

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      await api.delete(`/promociones-productos/${idRelacion}`);

      setMensaje("Producto retirado de la promoción.");
      await cargarDatos();

      const actualizada = promociones.find(
        (item) => item.id_promocion === promocionSeleccionada.id_promocion
      );

      if (actualizada) {
        setPromocionSeleccionada(actualizada);
      }
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo retirar el producto de la promoción."
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando promociones...</h2>
          <p>Estamos obteniendo las promociones comerciales.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Marketing / catálogo</span>
          <h1>Promociones</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes crear
            descuentos, campañas y promociones asociadas a productos.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarDatos}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Promociones registradas</h2>
            <span>{promocionesFiltradas.length} promoción(es)</span>
          </div>

          <button className="nueva-promocion-btn" onClick={abrirCrearPromocion}>
            <FiPlus />
            Nueva promoción
          </button>
        </div>

        <div className="promociones-toolbar">
          <div className="search-box promociones-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por nombre, tipo o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {promocionesFiltradas.length === 0 ? (
          <p className="empty-text">No se encontraron promociones.</p>
        ) : (
          <div className="promociones-grid-admin">
            {promocionesFiltradas.map((promocion) => (
              <article
                className="promocion-admin-card"
                key={promocion.id_promocion}
              >
                <div className="promocion-top">
                  <div className="promocion-icon">
                    {obtenerIconoTipo(promocion.tipo_descuento)}
                  </div>

                  {promocion.estado ? (
                    <span className="badge-estado">Activa</span>
                  ) : (
                    <span className="badge-inactivo">Inactiva</span>
                  )}
                </div>

                <h3>{promocion.nombre_promocion}</h3>

                <p>
                  {promocion.descripcion ||
                    "Promoción sin descripción registrada."}
                </p>

                <div className="promocion-descuento">
                  <span>Descuento</span>
                  <strong>{obtenerTextoDescuento(promocion)}</strong>
                </div>

                <div className="promocion-datos">
                  <span>
                    <FiCalendar />
                    {formatoFecha(promocion.fecha_inicio)} -{" "}
                    {formatoFecha(promocion.fecha_fin)}
                  </span>

                  <span>
                    <FiDollarSign />
                    Monto mínimo:{" "}
                    {promocion.monto_minimo
                      ? formatoSoles(promocion.monto_minimo)
                      : "No aplica"}
                  </span>

                  <span>
                    <FiPackage />
                    {promocion.productos_count ?? promocion.productos?.length ?? 0}{" "}
                    producto(s)
                  </span>
                </div>

                {promocion.productos && promocion.productos.length > 0 && (
                  <div className="promocion-productos-lista">
                    {promocion.productos.slice(0, 4).map((producto) => (
                      <span key={producto.id_producto}>
                        {producto.nombre_producto}
                      </span>
                    ))}

                    {promocion.productos.length > 4 && (
                      <span>+{promocion.productos.length - 4} más</span>
                    )}
                  </div>
                )}

                <div className="promocion-actions">
                  <button
                    type="button"
                    className="detalle-btn"
                    onClick={() => abrirEditarPromocion(promocion)}
                  >
                    <FiEdit2 />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="detalle-btn"
                    onClick={() => abrirGestionProductos(promocion)}
                  >
                    <FiPackage />
                    Productos
                  </button>

                  <button
                    type="button"
                    className={promocion.estado ? "eliminar-btn" : "activar-btn"}
                    onClick={() => cambiarEstadoPromocion(promocion)}
                  >
                    {promocion.estado ? <FiTrash2 /> : <FiRefreshCw />}
                    {promocion.estado ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="cliente-modal promocion-modal">
            <div className="cliente-modal-head">
              <div>
                <span>
                  {promocionEditando ? "Editar promoción" : "Nueva promoción"}
                </span>
                <h2>
                  {promocionEditando
                    ? "Actualizar promoción"
                    : "Registrar promoción"}
                </h2>
              </div>

              <button type="button" onClick={cerrarModal}>
                <FiX />
              </button>
            </div>

            <form className="promocion-modal-form" onSubmit={guardarPromocion}>
              <label>
                Nombre de promoción *
                <input
                  type="text"
                  placeholder="Ej: Semana Dulce"
                  value={formPromocion.nombre_promocion}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      nombre_promocion: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Tipo de descuento *
                <select
                  value={formPromocion.tipo_descuento}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      tipo_descuento: e.target.value,
                    })
                  }
                  required
                >
                  <option value="porcentaje">Porcentaje</option>
                  <option value="monto_fijo">Monto fijo</option>
                  <option value="combo">Combo</option>
                  <option value="cumpleanos">Cumpleaños</option>
                </select>
              </label>

              <label>
                Valor descuento *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 10"
                  value={formPromocion.valor_descuento}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      valor_descuento: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Monto mínimo
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 50.00"
                  value={formPromocion.monto_minimo}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      monto_minimo: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Fecha inicio *
                <input
                  type="date"
                  value={formPromocion.fecha_inicio}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      fecha_inicio: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Fecha fin *
                <input
                  type="date"
                  value={formPromocion.fecha_fin}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      fecha_fin: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label className="promocion-modal-full">
                Descripción
                <textarea
                  placeholder="Descripción breve de la promoción"
                  value={formPromocion.descripcion}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      descripcion: e.target.value,
                    })
                  }
                />
              </label>

              <label className="cliente-check promocion-modal-full">
                <input
                  type="checkbox"
                  checked={formPromocion.estado}
                  onChange={(e) =>
                    setFormPromocion({
                      ...formPromocion,
                      estado: e.target.checked,
                    })
                  }
                />
                Promoción activa
              </label>

              <div className="cliente-modal-actions promocion-modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={guardando}>
                  {guardando
                    ? "Guardando..."
                    : promocionEditando
                    ? "Actualizar promoción"
                    : "Guardar promoción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalProductosAbierto && promocionSeleccionada && (
        <div className="modal-overlay">
          <div className="cliente-modal promocion-productos-modal">
            <div className="cliente-modal-head">
              <div>
                <span>Productos de promoción</span>
                <h2>{promocionSeleccionada.nombre_promocion}</h2>
              </div>

              <button type="button" onClick={cerrarGestionProductos}>
                <FiX />
              </button>
            </div>

            <form
              className="promocion-productos-form"
              onSubmit={asignarProductoPromocion}
            >
              <label>
                Seleccionar producto
                <select
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
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
              </label>

              <button type="submit" disabled={guardando}>
                <FiPlus />
                Agregar producto
              </button>
            </form>

            <div className="promocion-productos-asignados">
              <h3>Productos asignados</h3>

              {promocionSeleccionada.productos?.length > 0 ? (
                promocionSeleccionada.productos.map((producto) => (
                  <div
                    className="promocion-producto-row"
                    key={producto.id_producto}
                  >
                    <div>
                      <strong>{producto.nombre_producto}</strong>
                      <small>{formatoSoles(producto.precio)}</small>
                    </div>

                    <button
                      type="button"
                      className="eliminar-btn"
                      onClick={() => quitarProductoPromocion(producto)}
                    >
                      <FiTrash2 />
                      Quitar
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-text">
                  Esta promoción todavía no tiene productos asignados.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Promociones;