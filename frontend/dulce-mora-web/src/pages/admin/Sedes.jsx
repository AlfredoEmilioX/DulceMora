import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiMapPin,
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiPhone,
  FiUsers,
  FiPackage,
  FiHome,
} from "react-icons/fi";

function Sedes() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [sedes, setSedes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalSede, setModalSede] = useState(false);
  const [sedeEditando, setSedeEditando] = useState(null);

  const [formSede, setFormSede] = useState({
    nombre_comercial: "",
    direccion: "",
    telefono: "",
    estado: true,
  });

  const cargarSedes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sedes");
      setSedes(response.data || []);
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudieron cargar las sedes.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSedes();
  }, []);

  const sedesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return sedes;

    return sedes.filter((sede) => {
      const nombre = String(sede.nombre_comercial || "").toLowerCase();
      const direccion = String(sede.direccion || "").toLowerCase();
      const telefono = String(sede.telefono || "").toLowerCase();

      return (
        nombre.includes(texto) ||
        direccion.includes(texto) ||
        telefono.includes(texto) ||
        String(sede.id_sede).includes(texto)
      );
    });
  }, [sedes, busqueda]);

  const resumen = useMemo(() => {
    const activas = sedes.filter(
      (sede) => sede.estado === true || sede.estado === 1
    ).length;

    const inactivas = sedes.length - activas;

    const usuariosAsignados = sedes.reduce((total, sede) => {
      return total + Number(sede.usuarios_count || 0);
    }, 0);

    const stockAsignado = sedes.reduce((total, sede) => {
      return total + Number(sede.productos_stock_count || 0);
    }, 0);

    return {
      total: sedes.length,
      activas,
      inactivas,
      usuariosAsignados,
      stockAsignado,
    };
  }, [sedes]);

  const limpiarFormulario = () => {
    setFormSede({
      nombre_comercial: "",
      direccion: "",
      telefono: "",
      estado: true,
    });

    setSedeEditando(null);
  };

  const abrirNuevaSede = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalSede(true);
  };

  const abrirEditarSede = (sede) => {
    setMensaje("");
    setError("");
    setSedeEditando(sede);

    setFormSede({
      nombre_comercial: sede.nombre_comercial || "",
      direccion: sede.direccion || "",
      telefono: sede.telefono || "",
      estado: sede.estado === true || sede.estado === 1,
    });

    setModalSede(true);
  };

  const cerrarModal = () => {
    setModalSede(false);
    limpiarFormulario();
  };

  const guardarSede = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formSede.nombre_comercial.trim()) {
      setError("Ingresa el nombre comercial de la sede.");
      return;
    }

    if (!formSede.direccion.trim()) {
      setError("Ingresa la dirección de la sede.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        nombre_comercial: formSede.nombre_comercial.trim(),
        direccion: formSede.direccion.trim(),
        telefono: formSede.telefono.trim() || null,
        estado: formSede.estado,
      };

      let response;

      if (sedeEditando) {
        response = await api.put(`/sedes/${sedeEditando.id_sede}`, payload);
      } else {
        response = await api.post("/sedes", payload);
      }

      setMensaje(
        response.data.message ||
          (sedeEditando
            ? "Sede actualizada correctamente."
            : "Sede registrada correctamente.")
      );

      cerrarModal();
      await cargarSedes();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo guardar la sede.");
        } else {
          setError(err.response.data.message || "No se pudo guardar la sede.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoSede = async (sede) => {
    const activa = sede.estado === true || sede.estado === 1;
    const accion = activa ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} la sede "${sede.nombre_comercial}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(`/sedes/${sede.id_sede}/cambiar-estado`);

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarSedes();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudo cambiar el estado.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando sedes...</h2>
          <p>Estamos obteniendo los locales registrados.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Administración / sedes</span>
          <h1>Sedes</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            registrar y controlar los locales de Dulce Mora.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarSedes}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="sedes-summary">
        <article>
          <div className="sedes-summary-icon">
            <FiHome />
          </div>
          <div>
            <span>Total sedes</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article>
          <div className="sedes-summary-icon activa">
            <FiMapPin />
          </div>
          <div>
            <span>Activas</span>
            <strong>{resumen.activas}</strong>
          </div>
        </article>

        <article>
          <div className="sedes-summary-icon usuarios">
            <FiUsers />
          </div>
          <div>
            <span>Usuarios asignados</span>
            <strong>{resumen.usuariosAsignados}</strong>
          </div>
        </article>

        <article>
          <div className="sedes-summary-icon stock">
            <FiPackage />
          </div>
          <div>
            <span>Registros de stock</span>
            <strong>{resumen.stockAsignado}</strong>
          </div>
        </article>
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Sedes registradas</h2>
            <span>{sedesFiltradas.length} sede(s)</span>
          </div>

          <button className="nueva-sede-btn" onClick={abrirNuevaSede}>
            <FiPlus />
            Nueva sede
          </button>
        </div>

        <div className="sedes-toolbar">
          <div className="search-box sedes-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por nombre, dirección, teléfono o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {sedesFiltradas.length === 0 ? (
          <p className="empty-text">No se encontraron sedes registradas.</p>
        ) : (
          <div className="sedes-table-wrap">
            <table className="sedes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sede</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Usuarios</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {sedesFiltradas.map((sede) => {
                  const activa = sede.estado === true || sede.estado === 1;

                  return (
                    <tr key={sede.id_sede}>
                      <td>#{sede.id_sede}</td>

                      <td>
                        <strong>{sede.nombre_comercial}</strong>
                      </td>

                      <td>
                        <span className="sede-info-mini">
                          <FiMapPin />
                          {sede.direccion}
                        </span>
                      </td>

                      <td>
                        <span className="sede-info-mini">
                          <FiPhone />
                          {sede.telefono || "No registrado"}
                        </span>
                      </td>

                      <td>
                        <strong>{sede.usuarios_count || 0}</strong>
                      </td>

                      <td>
                        <strong>{sede.productos_stock_count || 0}</strong>
                      </td>

                      <td>
                        {activa ? (
                          <span className="sede-estado activa">Activa</span>
                        ) : (
                          <span className="sede-estado inactiva">Inactiva</span>
                        )}
                      </td>

                      <td>
                        <div className="sedes-actions">
                          <button
                            type="button"
                            className="editar-btn"
                            onClick={() => abrirEditarSede(sede)}
                          >
                            <FiEdit2 />
                            Editar
                          </button>

                          <button
                            type="button"
                            className={activa ? "eliminar-btn" : "activar-btn"}
                            onClick={() => cambiarEstadoSede(sede)}
                          >
                            {activa ? (
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

      {modalSede && (
        <div className="modal-overlay">
          <div className="cliente-modal sede-modal">
            <div className="cliente-modal-head">
              <div>
                <span>{sedeEditando ? "Editar sede" : "Nueva sede"}</span>
                <h2>
                  {sedeEditando
                    ? sedeEditando.nombre_comercial
                    : "Registrar sede"}
                </h2>
              </div>

              <button type="button" onClick={cerrarModal}>
                <FiX />
              </button>
            </div>

            <form className="sede-form" onSubmit={guardarSede}>
              <label className="sede-full">
                Nombre comercial *
                <input
                  type="text"
                  placeholder="Ej: Dulce Mora Huancayo Principal"
                  value={formSede.nombre_comercial}
                  onChange={(e) =>
                    setFormSede({
                      ...formSede,
                      nombre_comercial: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label className="sede-full">
                Dirección *
                <input
                  type="text"
                  placeholder="Ej: Jr. Nacional 608, Huancayo"
                  value={formSede.direccion}
                  onChange={(e) =>
                    setFormSede({
                      ...formSede,
                      direccion: e.target.value,
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
                  value={formSede.telefono}
                  onChange={(e) =>
                    setFormSede({
                      ...formSede,
                      telefono: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Estado
                <select
                  value={formSede.estado ? "1" : "0"}
                  onChange={(e) =>
                    setFormSede({
                      ...formSede,
                      estado: e.target.value === "1",
                    })
                  }
                >
                  <option value="1">Activa</option>
                  <option value="0">Inactiva</option>
                </select>
              </label>

              <div className="cliente-modal-actions sede-actions-modal">
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
                    : sedeEditando
                    ? "Actualizar sede"
                    : "Registrar sede"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Sedes;