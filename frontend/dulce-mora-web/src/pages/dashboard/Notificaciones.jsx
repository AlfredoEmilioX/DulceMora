import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../../styles/dashboard/notificaciones.css";

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [resumen, setResumen] = useState({
    total: 0,
    no_leidas: 0,
    leidas: 0,
    hoy: 0,
  });

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] =
    useState(null);

  const [formulario, setFormulario] = useState({
    id_usuario: "",
    titulo: "",
    mensaje: "",
    tipo: "sistema",
    leido: false,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [notificacionesRes, resumenRes, usuariosRes] = await Promise.all([
        api.get("/notificaciones"),
        api.get("/notificaciones/resumen"),
        api.get("/usuarios"),
      ]);

      setNotificaciones(
        Array.isArray(notificacionesRes.data) ? notificacionesRes.data : []
      );

      setResumen(resumenRes.data || {});
      setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : []);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar las notificaciones.");
    } finally {
      setCargando(false);
    }
  };

  const notificacionesFiltradas = useMemo(() => {
    let lista = [...notificaciones];

    if (filtro === "no_leidas") {
      lista = lista.filter((item) => !item.leido);
    }

    if (filtro === "leidas") {
      lista = lista.filter((item) => item.leido);
    }

    const texto = busqueda.toLowerCase().trim();

    if (!texto) return lista;

    return lista.filter((item) => {
      const usuario = `${item.usuario?.nombres || ""} ${
        item.usuario?.apellidos || ""
      }`;

      return (
        String(item.id_notificacion || "").includes(texto) ||
        (item.titulo || "").toLowerCase().includes(texto) ||
        (item.mensaje || "").toLowerCase().includes(texto) ||
        (item.tipo || "").toLowerCase().includes(texto) ||
        usuario.toLowerCase().includes(texto)
      );
    });
  }, [notificaciones, busqueda, filtro]);

  const abrirNuevaNotificacion = () => {
    setModoEditar(false);
    setNotificacionSeleccionada(null);
    setFormulario({
      id_usuario: "",
      titulo: "",
      mensaje: "",
      tipo: "sistema",
      leido: false,
    });
    setModalAbierto(true);
  };

  const abrirEditarNotificacion = (notificacion) => {
    setModoEditar(true);
    setNotificacionSeleccionada(notificacion);
    setFormulario({
      id_usuario: notificacion.id_usuario || "",
      titulo: notificacion.titulo || "",
      mensaje: notificacion.mensaje || "",
      tipo: notificacion.tipo || "sistema",
      leido: Boolean(notificacion.leido),
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEditar(false);
    setNotificacionSeleccionada(null);
  };

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const guardarNotificacion = async (e) => {
    e.preventDefault();

    if (
      !formulario.id_usuario ||
      !formulario.titulo.trim() ||
      !formulario.mensaje.trim()
    ) {
      alert("Completa usuario, título y mensaje.");
      return;
    }

    try {
      setGuardando(true);

      if (modoEditar && notificacionSeleccionada) {
        await api.put(
          `/notificaciones/${notificacionSeleccionada.id_notificacion}`,
          formulario
        );

        alert("Notificación actualizada correctamente.");
      } else {
        await api.post("/notificaciones", formulario);
        alert("Notificación registrada correctamente.");
      }

      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "No se pudo guardar la notificación."
      );
    } finally {
      setGuardando(false);
    }
  };

  const marcarLeida = async (notificacion) => {
    try {
      await api.patch(
        `/notificaciones/${notificacion.id_notificacion}/marcar-leida`
      );

      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar como leída.");
    }
  };

  const marcarNoLeida = async (notificacion) => {
    try {
      await api.patch(
        `/notificaciones/${notificacion.id_notificacion}/marcar-no-leida`
      );

      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("No se pudo marcar como no leída.");
    }
  };

  const eliminarNotificacion = async (notificacion) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar la notificación #${notificacion.id_notificacion}?`
    );

    if (!confirmar) return;

    try {
      await api.delete(`/notificaciones/${notificacion.id_notificacion}`);
      alert("Notificación eliminada correctamente.");
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "No se pudo eliminar la notificación."
      );
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const claseTipo = (tipo) => {
    if (tipo === "stock") return "tipo-notificacion tipo-stock";
    if (tipo === "pedido") return "tipo-notificacion tipo-pedido";
    if (tipo === "cumpleanos") return "tipo-notificacion tipo-cumpleanos";
    if (tipo === "promocion") return "tipo-notificacion tipo-promocion";
    return "tipo-notificacion tipo-sistema";
  };

  return (
    <div className="notificaciones-page">
      <section className="notificaciones-header">
        <div>
          <p className="notificaciones-breadcrumb">
            FIDELIZACIÓN / NOTIFICACIONES
          </p>
          <h1>Notificaciones</h1>
          <p>
            Administra avisos internos del sistema, alertas pendientes y
            mensajes importantes para los usuarios.
          </p>
        </div>

        <button className="btn-noti-principal" onClick={cargarDatos}>
          ↻ Actualizar
        </button>
      </section>

      <section className="notificaciones-resumen">
        <div className="noti-card">
          <div className="noti-icono rosado">🔔</div>
          <div>
            <span>Total</span>
            <strong>{resumen.total || 0}</strong>
          </div>
        </div>

        <div className="noti-card">
          <div className="noti-icono amarillo">●</div>
          <div>
            <span>No leídas</span>
            <strong>{resumen.no_leidas || 0}</strong>
          </div>
        </div>

        <div className="noti-card">
          <div className="noti-icono verde">✓</div>
          <div>
            <span>Leídas</span>
            <strong>{resumen.leidas || 0}</strong>
          </div>
        </div>

        <div className="noti-card">
          <div className="noti-icono morado">📅</div>
          <div>
            <span>Hoy</span>
            <strong>{resumen.hoy || 0}</strong>
          </div>
        </div>
      </section>

      <section className="notificaciones-contenedor">
        <div className="notificaciones-tabla-header">
          <div>
            <h2>Notificaciones registradas</h2>
            <p>{notificacionesFiltradas.length} notificación(es)</p>
          </div>

          <div className="notificaciones-header-actions">
            <div className="notificaciones-filtros">
              <button
                className={filtro === "todas" ? "activo" : ""}
                onClick={() => setFiltro("todas")}
              >
                Todas
              </button>

              <button
                className={filtro === "no_leidas" ? "activo" : ""}
                onClick={() => setFiltro("no_leidas")}
              >
                No leídas
              </button>

              <button
                className={filtro === "leidas" ? "activo" : ""}
                onClick={() => setFiltro("leidas")}
              >
                Leídas
              </button>
            </div>

            <button
              className="btn-noti-principal"
              onClick={abrirNuevaNotificacion}
            >
              + Nueva notificación
            </button>
          </div>
        </div>

        <div className="notificaciones-buscador">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Buscar por título, mensaje, tipo, usuario o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="notificaciones-tabla-scroll">
          <table className="notificaciones-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Título</th>
                <th>Mensaje</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Lectura</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="8" className="tabla-vacia">
                    Cargando notificaciones...
                  </td>
                </tr>
              ) : notificacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="tabla-vacia">
                    No hay notificaciones registradas.
                  </td>
                </tr>
              ) : (
                notificacionesFiltradas.map((notificacion) => (
                  <tr key={notificacion.id_notificacion}>
                    <td>#{notificacion.id_notificacion}</td>

                    <td>
                      <span className={claseTipo(notificacion.tipo)}>
                        {notificacion.tipo || "sistema"}
                      </span>
                    </td>

                    <td className="noti-titulo">{notificacion.titulo}</td>

                    <td className="noti-mensaje">{notificacion.mensaje}</td>

                    <td>
                      {notificacion.usuario
                        ? `${notificacion.usuario.nombres} ${notificacion.usuario.apellidos}`
                        : "Sin usuario"}
                    </td>

                    <td>{formatearFecha(notificacion.created_at)}</td>

                    <td>
                      <span
                        className={
                          notificacion.leido
                            ? "estado-lectura leida"
                            : "estado-lectura no-leida"
                        }
                      >
                        {notificacion.leido ? "Leída" : "No leída"}
                      </span>
                    </td>

                    <td>
                      <div className="notificaciones-acciones">
                        <button
                          className="btn-noti-accion editar"
                          onClick={() => abrirEditarNotificacion(notificacion)}
                        >
                          ✎ Editar
                        </button>

                        {notificacion.leido ? (
                          <button
                            className="btn-noti-accion no-leida"
                            onClick={() => marcarNoLeida(notificacion)}
                          >
                            Marcar no leída
                          </button>
                        ) : (
                          <button
                            className="btn-noti-accion leida"
                            onClick={() => marcarLeida(notificacion)}
                          >
                            Marcar leída
                          </button>
                        )}

                        <button
                          className="btn-noti-accion eliminar"
                          onClick={() => eliminarNotificacion(notificacion)}
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalAbierto && (
        <div className="noti-modal-fondo">
          <div className="noti-modal">
            <div className="noti-modal-header">
              <div>
                <h2>
                  {modoEditar ? "Editar notificación" : "Nueva notificación"}
                </h2>
                <p>
                  {modoEditar
                    ? "Actualiza los datos de la notificación."
                    : "Registra un nuevo aviso interno para un usuario."}
                </p>
              </div>

              <button className="btn-noti-cerrar" onClick={cerrarModal}>
                ×
              </button>
            </div>

            <form onSubmit={guardarNotificacion} className="noti-formulario">
              <div className="noti-form-grid">
                <label>
                  Usuario
                  <select
                    name="id_usuario"
                    value={formulario.id_usuario}
                    onChange={manejarCambio}
                    required
                  >
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map((usuario) => (
                      <option
                        key={usuario.id_usuario}
                        value={usuario.id_usuario}
                      >
                        {usuario.nombres} {usuario.apellidos}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tipo
                  <select
                    name="tipo"
                    value={formulario.tipo}
                    onChange={manejarCambio}
                  >
                    <option value="sistema">Sistema</option>
                    <option value="stock">Stock</option>
                    <option value="pedido">Pedido</option>
                    <option value="cumpleanos">Cumpleaños</option>
                    <option value="promocion">Promoción</option>
                  </select>
                </label>

                <label className="campo-completo">
                  Título
                  <input
                    type="text"
                    name="titulo"
                    value={formulario.titulo}
                    onChange={manejarCambio}
                    placeholder="Ejemplo: Stock bajo"
                    required
                  />
                </label>

                <label className="campo-completo">
                  Mensaje
                  <textarea
                    name="mensaje"
                    value={formulario.mensaje}
                    onChange={manejarCambio}
                    placeholder="Escribe el contenido de la notificación..."
                    rows="4"
                    required
                  />
                </label>

                <label className="campo-completo">
                  Estado de lectura
                  <div className="noti-check">
                    <input
                      type="checkbox"
                      name="leido"
                      checked={formulario.leido}
                      onChange={manejarCambio}
                    />
                    <span>{formulario.leido ? "Leída" : "No leída"}</span>
                  </div>
                </label>
              </div>

              <div className="noti-modal-acciones">
                <button
                  type="button"
                  className="btn-noti-secundario"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-noti-principal"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}