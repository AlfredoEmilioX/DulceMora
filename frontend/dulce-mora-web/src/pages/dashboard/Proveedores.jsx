import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiTruck,
  FiRefreshCw,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFileText,
} from "react-icons/fi";

function Proveedores() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalProveedor, setModalProveedor] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);

  const [formProveedor, setFormProveedor] = useState({
    razon_social: "",
    ruc: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: true,
  });

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/proveedores");
      setProveedores(response.data || []);
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message || "No se pudieron cargar los proveedores."
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const proveedoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return proveedores;

    return proveedores.filter((proveedor) => {
      const razon = String(proveedor.razon_social || "").toLowerCase();
      const ruc = String(proveedor.ruc || "").toLowerCase();
      const telefono = String(proveedor.telefono || "").toLowerCase();
      const email = String(proveedor.email || "").toLowerCase();
      const direccion = String(proveedor.direccion || "").toLowerCase();

      return (
        razon.includes(texto) ||
        ruc.includes(texto) ||
        telefono.includes(texto) ||
        email.includes(texto) ||
        direccion.includes(texto)
      );
    });
  }, [proveedores, busqueda]);

  const resumen = useMemo(() => {
    const activos = proveedores.filter(
      (proveedor) => proveedor.estado === true || proveedor.estado === 1
    ).length;

    const inactivos = proveedores.length - activos;

    const conCompras = proveedores.filter(
      (proveedor) => Number(proveedor.compras_count || 0) > 0
    ).length;

    return {
      total: proveedores.length,
      activos,
      inactivos,
      conCompras,
    };
  }, [proveedores]);

  const limpiarFormulario = () => {
    setFormProveedor({
      razon_social: "",
      ruc: "",
      telefono: "",
      email: "",
      direccion: "",
      estado: true,
    });
    setProveedorEditando(null);
  };

  const abrirNuevoProveedor = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalProveedor(true);
  };

  const abrirEditarProveedor = (proveedor) => {
    setMensaje("");
    setError("");
    setProveedorEditando(proveedor);

    setFormProveedor({
      razon_social: proveedor.razon_social || "",
      ruc: proveedor.ruc || "",
      telefono: proveedor.telefono || "",
      email: proveedor.email || "",
      direccion: proveedor.direccion || "",
      estado: proveedor.estado === true || proveedor.estado === 1,
    });

    setModalProveedor(true);
  };

  const cerrarModal = () => {
    setModalProveedor(false);
    limpiarFormulario();
  };

  const guardarProveedor = async (e) => {
    e.preventDefault();

    if (!formProveedor.razon_social.trim()) {
      setError("La razón social es obligatoria.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      const payload = {
        razon_social: formProveedor.razon_social.trim(),
        ruc: formProveedor.ruc.trim() || null,
        telefono: formProveedor.telefono.trim() || null,
        email: formProveedor.email.trim() || null,
        direccion: formProveedor.direccion.trim() || null,
        estado: formProveedor.estado,
      };

      let response;

      if (proveedorEditando) {
        response = await api.put(
          `/proveedores/${proveedorEditando.id_proveedor}`,
          payload
        );
      } else {
        response = await api.post("/proveedores", payload);
      }

      setMensaje(
        response.data.message ||
          (proveedorEditando
            ? "Proveedor actualizado correctamente."
            : "Proveedor registrado correctamente.")
      );

      cerrarModal();
      await cargarProveedores();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo guardar el proveedor.");
        } else {
          setError(
            err.response.data.message || "No se pudo guardar el proveedor."
          );
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoProveedor = async (proveedor) => {
    const activo = proveedor.estado === true || proveedor.estado === 1;
    const accion = activo ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} el proveedor "${proveedor.razon_social}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(
        `/proveedores/${proveedor.id_proveedor}/cambiar-estado`
      );

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarProveedores();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo cambiar el estado del proveedor."
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
          <h2>Cargando proveedores...</h2>
          <p>Estamos obteniendo la lista de proveedores.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Operaciones / proveedores</span>
          <h1>Proveedores</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            registrar, editar y controlar proveedores para compras.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarProveedores}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="proveedores-summary">
        <article>
          <div className="proveedores-summary-icon">
            <FiTruck />
          </div>
          <div>
            <span>Total proveedores</span>
            <strong>{resumen.total}</strong>
          </div>
        </article>

        <article>
          <div className="proveedores-summary-icon active">
            <FiFileText />
          </div>
          <div>
            <span>Activos</span>
            <strong>{resumen.activos}</strong>
          </div>
        </article>

        <article>
          <div className="proveedores-summary-icon inactive">
            <FiX />
          </div>
          <div>
            <span>Inactivos</span>
            <strong>{resumen.inactivos}</strong>
          </div>
        </article>

        <article>
          <div className="proveedores-summary-icon compras">
            <FiTruck />
          </div>
          <div>
            <span>Con compras</span>
            <strong>{resumen.conCompras}</strong>
          </div>
        </article>
      </section>

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Proveedores registrados</h2>
            <span>{proveedoresFiltrados.length} proveedor(es)</span>
          </div>

          <button className="nuevo-proveedor-btn" onClick={abrirNuevoProveedor}>
            <FiPlus />
            Nuevo proveedor
          </button>
        </div>

        <div className="proveedores-toolbar">
          <div className="search-box proveedores-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por razón social, RUC, teléfono, correo o dirección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {proveedoresFiltrados.length === 0 ? (
          <p className="empty-text">No se encontraron proveedores registrados.</p>
        ) : (
          <div className="proveedores-table-wrap">
            <table className="proveedores-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Proveedor</th>
                  <th>RUC</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                  <th>Compras</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {proveedoresFiltrados.map((proveedor) => {
                  const activo =
                    proveedor.estado === true || proveedor.estado === 1;

                  return (
                    <tr key={proveedor.id_proveedor}>
                      <td>#{proveedor.id_proveedor}</td>

                      <td>
                        <strong>{proveedor.razon_social}</strong>
                      </td>

                      <td>{proveedor.ruc || "Sin RUC"}</td>

                      <td>
                        <span className="proveedor-info-mini">
                          <FiPhone />
                          {proveedor.telefono || "No registrado"}
                        </span>
                      </td>

                      <td>
                        <span className="proveedor-info-mini">
                          <FiMail />
                          {proveedor.email || "No registrado"}
                        </span>
                      </td>

                      <td>
                        <span className="proveedor-info-mini">
                          <FiMapPin />
                          {proveedor.direccion || "No registrada"}
                        </span>
                      </td>

                      <td>
                        <strong>{proveedor.compras_count || 0}</strong>
                      </td>

                      <td>
                        {activo ? (
                          <span className="proveedor-estado activo">
                            Activo
                          </span>
                        ) : (
                          <span className="proveedor-estado inactivo">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="proveedores-actions">
                          <button
                            type="button"
                            className="editar-btn"
                            onClick={() => abrirEditarProveedor(proveedor)}
                          >
                            <FiEdit2 />
                            Editar
                          </button>

                          <button
                            type="button"
                            className={activo ? "eliminar-btn" : "activar-btn"}
                            onClick={() => cambiarEstadoProveedor(proveedor)}
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

      {modalProveedor && (
        <div className="modal-overlay">
          <div className="cliente-modal proveedor-modal">
            <div className="cliente-modal-head">
              <div>
                <span>
                  {proveedorEditando
                    ? "Editar proveedor"
                    : "Nuevo proveedor"}
                </span>
                <h2>
                  {proveedorEditando
                    ? proveedorEditando.razon_social
                    : "Registrar proveedor"}
                </h2>
              </div>

              <button type="button" onClick={cerrarModal}>
                <FiX />
              </button>
            </div>

            <form className="proveedor-form" onSubmit={guardarProveedor}>
              <label className="proveedor-full">
                Razón social *
                <input
                  type="text"
                  placeholder="Ej: Distribuidora Dulce S.A.C."
                  value={formProveedor.razon_social}
                  onChange={(e) =>
                    setFormProveedor({
                      ...formProveedor,
                      razon_social: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                RUC
                <input
                  type="text"
                  placeholder="Ej: 20481234567"
                  value={formProveedor.ruc}
                  onChange={(e) =>
                    setFormProveedor({
                      ...formProveedor,
                      ruc: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Teléfono
                <input
                  type="text"
                  placeholder="Ej: 987654321"
                  value={formProveedor.telefono}
                  onChange={(e) =>
                    setFormProveedor({
                      ...formProveedor,
                      telefono: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  placeholder="Ej: proveedor@correo.com"
                  value={formProveedor.email}
                  onChange={(e) =>
                    setFormProveedor({
                      ...formProveedor,
                      email: e.target.value,
                    })
                  }
                />
              </label>

              <label className="proveedor-full">
                Dirección
                <input
                  type="text"
                  placeholder="Ej: Huancayo, Junín"
                  value={formProveedor.direccion}
                  onChange={(e) =>
                    setFormProveedor({
                      ...formProveedor,
                      direccion: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Estado
                <select
                  value={formProveedor.estado ? "1" : "0"}
                  onChange={(e) =>
                    setFormProveedor({
                      ...formProveedor,
                      estado: e.target.value === "1",
                    })
                  }
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </label>

              <div className="cliente-modal-actions proveedor-actions-modal">
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
                    : proveedorEditando
                    ? "Actualizar proveedor"
                    : "Registrar proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Proveedores;