import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiUsers,
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUserCheck,
  FiUserX,
  FiMapPin,
  FiMail,
  FiPhone,
  FiShield,
} from "react-icons/fi";

function Usuarios() {
  const usuarioActual = JSON.parse(localStorage.getItem("usuario"));

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalUsuario, setModalUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [formUsuario, setFormUsuario] = useState({
    id_rol: "",
    id_sede: "",
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    telefono: "",
    estado: true,
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [usuariosRes, rolesRes, sedesRes] = await Promise.all([
        api.get("/usuarios"),
        api.get("/roles"),
        api.get("/sedes"),
      ]);

      setUsuarios(usuariosRes.data || []);
      setRoles(rolesRes.data || []);
      setSedes(sedesRes.data || []);
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudieron cargar los usuarios.");
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

  const rolesActivos = useMemo(() => {
    return roles.filter((rol) => rol.estado === true || rol.estado === 1);
  }, [roles]);

  const sedesActivas = useMemo(() => {
    return sedes.filter((sede) => sede.estado === true || sede.estado === 1);
  }, [sedes]);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const nombres = String(usuario.nombres || "").toLowerCase();
      const apellidos = String(usuario.apellidos || "").toLowerCase();
      const email = String(usuario.email || "").toLowerCase();
      const telefono = String(usuario.telefono || "").toLowerCase();
      const rol = String(usuario.rol?.nombre_rol || "").toLowerCase();
      const sede = String(usuario.sede?.nombre_comercial || "").toLowerCase();

      const coincideTexto =
        !texto ||
        nombres.includes(texto) ||
        apellidos.includes(texto) ||
        email.includes(texto) ||
        telefono.includes(texto) ||
        rol.includes(texto) ||
        sede.includes(texto) ||
        String(usuario.id_usuario).includes(texto);

      const coincideRol =
        !rolFiltro || Number(usuario.id_rol) === Number(rolFiltro);

      return coincideTexto && coincideRol;
    });
  }, [usuarios, busqueda, rolFiltro]);

  const resumen = useMemo(() => {
    const activos = usuarios.filter(
      (usuario) => usuario.estado === true || usuario.estado === 1
    ).length;

    const inactivos = usuarios.length - activos;

    const administradores = usuarios.filter((usuario) =>
      String(usuario.rol?.nombre_rol || "")
        .toLowerCase()
        .includes("administrador")
    ).length;

    const vendedores = usuarios.filter((usuario) =>
      String(usuario.rol?.nombre_rol || "")
        .toLowerCase()
        .includes("vendedor")
    ).length;

    return {
      total: usuarios.length,
      activos,
      inactivos,
      administradores,
      vendedores,
    };
  }, [usuarios]);

  const limpiarFormulario = () => {
    setFormUsuario({
      id_rol: "",
      id_sede: "",
      nombres: "",
      apellidos: "",
      email: "",
      password: "",
      telefono: "",
      estado: true,
    });

    setUsuarioEditando(null);
  };

  const abrirNuevoUsuario = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalUsuario(true);
  };

  const abrirEditarUsuario = (usuario) => {
    setMensaje("");
    setError("");
    setUsuarioEditando(usuario);

    setFormUsuario({
      id_rol: usuario.id_rol || "",
      id_sede: usuario.id_sede || "",
      nombres: usuario.nombres || "",
      apellidos: usuario.apellidos || "",
      email: usuario.email || "",
      password: "",
      telefono: usuario.telefono || "",
      estado: usuario.estado === true || usuario.estado === 1,
    });

    setModalUsuario(true);
  };

  const cerrarModal = () => {
    setModalUsuario(false);
    limpiarFormulario();
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formUsuario.id_rol) {
      setError("Selecciona un rol.");
      return;
    }

    if (!formUsuario.nombres.trim()) {
      setError("Ingresa los nombres del usuario.");
      return;
    }

    if (!formUsuario.email.trim()) {
      setError("Ingresa el correo del usuario.");
      return;
    }

    if (!usuarioEditando && !formUsuario.password.trim()) {
      setError("Ingresa una contraseña para el nuevo usuario.");
      return;
    }

    if (!usuarioEditando && formUsuario.password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (usuarioEditando && formUsuario.password && formUsuario.password.length < 6) {
      setError("La nueva contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        id_rol: Number(formUsuario.id_rol),
        id_sede: formUsuario.id_sede ? Number(formUsuario.id_sede) : null,
        nombres: formUsuario.nombres.trim(),
        apellidos: formUsuario.apellidos.trim() || null,
        email: formUsuario.email.trim(),
        telefono: formUsuario.telefono.trim() || null,
        estado: formUsuario.estado,
      };

      if (formUsuario.password.trim()) {
        payload.password = formUsuario.password.trim();
      }

      let response;

      if (usuarioEditando) {
        response = await api.put(
          `/usuarios/${usuarioEditando.id_usuario}`,
          payload
        );
      } else {
        response = await api.post("/usuarios", payload);
      }

      setMensaje(
        response.data.message ||
          (usuarioEditando
            ? "Usuario actualizado correctamente."
            : "Usuario registrado correctamente.")
      );

      cerrarModal();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo guardar el usuario.");
        } else {
          setError(err.response.data.message || "No se pudo guardar el usuario.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoUsuario = async (usuario) => {
    const activo = usuario.estado === true || usuario.estado === 1;
    const accion = activo ? "desactivar" : "activar";

    if (Number(usuarioActual?.id_usuario) === Number(usuario.id_usuario)) {
      setError("No puedes desactivar tu propio usuario desde esta pantalla.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} al usuario "${usuario.nombres}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(
        `/usuarios/${usuario.id_usuario}/cambiar-estado`
      );

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message || "No se pudo cambiar el estado del usuario."
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
          <h2>Cargando usuarios...</h2>
          <p>Estamos obteniendo las cuentas del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Administración / usuarios</span>
          <h1>Usuarios</h1>
          <p>
            Bienvenido, <strong>{usuarioActual?.nombres}</strong>. Aquí puedes
            registrar usuarios internos, asignar roles y sedes.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarDatos}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="usuarios-summary">
        <article>
          <div className="usuarios-summary-icon">
            <FiUsers />
          </div>
          <div>
            <span>Total usuarios</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article>
          <div className="usuarios-summary-icon activo">
            <FiUserCheck />
          </div>
          <div>
            <span>Activos</span>
            <strong>{resumen.activos}</strong>
          </div>
        </article>

        <article>
          <div className="usuarios-summary-icon inactivo">
            <FiUserX />
          </div>
          <div>
            <span>Inactivos</span>
            <strong>{resumen.inactivos}</strong>
          </div>
        </article>

        <article>
          <div className="usuarios-summary-icon admin">
            <FiShield />
          </div>
          <div>
            <span>Administradores</span>
            <strong>{resumen.administradores}</strong>
          </div>
        </article>
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Usuarios registrados</h2>
            <span>{usuariosFiltrados.length} usuario(s)</span>
          </div>

          <button className="nuevo-usuario-btn" onClick={abrirNuevoUsuario}>
            <FiPlus />
            Nuevo usuario
          </button>
        </div>

        <div className="usuarios-toolbar">
          <div className="search-box usuarios-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono, rol, sede o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="usuarios-select"
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.id_rol} value={rol.id_rol}>
                {rol.nombre_rol}
              </option>
            ))}
          </select>
        </div>

        {usuariosFiltrados.length === 0 ? (
          <p className="empty-text">No se encontraron usuarios registrados.</p>
        ) : (
          <div className="usuarios-table-wrap">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Sede</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => {
                  const activo =
                    usuario.estado === true || usuario.estado === 1;

                  return (
                    <tr key={usuario.id_usuario}>
                      <td>#{usuario.id_usuario}</td>

                      <td>
                        <strong>
                          {usuario.nombres} {usuario.apellidos || ""}
                        </strong>
                      </td>

                      <td>
                        <span className="usuario-info-mini">
                          <FiMail />
                          {usuario.email}
                        </span>
                      </td>

                      <td>
                        <span className="usuario-info-mini">
                          <FiPhone />
                          {usuario.telefono || "No registrado"}
                        </span>
                      </td>

                      <td>
                        <span className="usuario-rol">
                          <FiShield />
                          {usuario.rol?.nombre_rol || "Sin rol"}
                        </span>
                      </td>

                      <td>
                        <span className="usuario-info-mini">
                          <FiMapPin />
                          {usuario.sede?.nombre_comercial || "Sin sede"}
                        </span>
                      </td>

                      <td>
                        {activo ? (
                          <span className="usuario-estado activo">Activo</span>
                        ) : (
                          <span className="usuario-estado inactivo">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="usuarios-actions">
                          <button
                            type="button"
                            className="editar-btn"
                            onClick={() => abrirEditarUsuario(usuario)}
                          >
                            <FiEdit2 />
                            Editar
                          </button>

                          <button
                            type="button"
                            className={activo ? "eliminar-btn" : "activar-btn"}
                            onClick={() => cambiarEstadoUsuario(usuario)}
                          >
                            {activo ? (
                              <>
                                <FiTrash2 />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <FiRefreshCw />
                                Activar
                              </>
                            )}
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

      {modalUsuario && (
        <div className="modal-overlay">
          <div className="cliente-modal usuario-modal">
            <div className="cliente-modal-head">
              <div>
                <span>
                  {usuarioEditando ? "Editar usuario" : "Nuevo usuario"}
                </span>
                <h2>
                  {usuarioEditando
                    ? `${usuarioEditando.nombres} ${usuarioEditando.apellidos || ""}`
                    : "Registrar usuario"}
                </h2>
              </div>

              <button type="button" onClick={cerrarModal}>
                <FiX />
              </button>
            </div>

            <form className="usuario-form" onSubmit={guardarUsuario}>
              <label>
                Rol *
                <select
                  value={formUsuario.id_rol}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      id_rol: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {rolesActivos.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre_rol}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Sede
                <select
                  value={formUsuario.id_sede}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      id_sede: e.target.value,
                    })
                  }
                >
                  <option value="">Sin sede</option>
                  {sedesActivas.map((sede) => (
                    <option key={sede.id_sede} value={sede.id_sede}>
                      {sede.nombre_comercial}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nombres *
                <input
                  type="text"
                  placeholder="Ej: Bryan"
                  value={formUsuario.nombres}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      nombres: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Apellidos
                <input
                  type="text"
                  placeholder="Ej: Flores Barreto"
                  value={formUsuario.apellidos}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      apellidos: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Correo *
                <input
                  type="email"
                  placeholder="Ej: usuario@dulcemora.com"
                  value={formUsuario.email}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Teléfono
                <input
                  type="text"
                  placeholder="Ej: 987654321"
                  value={formUsuario.telefono}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      telefono: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                {usuarioEditando ? "Nueva contraseña" : "Contraseña *"}
                <input
                  type="password"
                  placeholder={
                    usuarioEditando
                      ? "Dejar vacío para mantener la actual"
                      : "Mínimo 6 caracteres"
                  }
                  value={formUsuario.password}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      password: e.target.value,
                    })
                  }
                  required={!usuarioEditando}
                />
              </label>

              <label>
                Estado
                <select
                  value={formUsuario.estado ? "1" : "0"}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      estado: e.target.value === "1",
                    })
                  }
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </label>

              <div className="cliente-modal-actions usuario-actions-modal">
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
                    : usuarioEditando
                    ? "Actualizar usuario"
                    : "Registrar usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Usuarios;