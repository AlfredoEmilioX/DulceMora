import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiGrid,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiPackage,
} from "react-icons/fi";

function Categorias() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [formCategoria, setFormCategoria] = useState({
    nombre_categoria: "",
    descripcion: "",
    estado: true,
  });

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categorias");
      setCategorias(response.data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return categorias;

    return categorias.filter((categoria) => {
      const nombre = String(categoria.nombre_categoria ?? "").toLowerCase();
      const descripcion = String(categoria.descripcion ?? "").toLowerCase();

      return nombre.includes(texto) || descripcion.includes(texto);
    });
  }, [categorias, busqueda]);

  const limpiarFormulario = () => {
    setCategoriaEditando(null);

    setFormCategoria({
      nombre_categoria: "",
      descripcion: "",
      estado: true,
    });
  };

  const abrirCrearCategoria = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalAbierto(true);
  };

  const abrirEditarCategoria = (categoria) => {
    setMensaje("");
    setError("");
    setCategoriaEditando(categoria);

    setFormCategoria({
      nombre_categoria: categoria.nombre_categoria || "",
      descripcion: categoria.descripcion || "",
      estado: categoria.estado === true || categoria.estado === 1,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiarFormulario();
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formCategoria.nombre_categoria.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        nombre_categoria: formCategoria.nombre_categoria,
        descripcion: formCategoria.descripcion || null,
        estado: formCategoria.estado,
      };

      if (categoriaEditando) {
        await api.put(
          `/categorias/${categoriaEditando.id_categoria}`,
          payload
        );
        setMensaje("Categoría actualizada correctamente.");
      } else {
        await api.post("/categorias", payload);
        setMensaje("Categoría registrada correctamente.");
      }

      cerrarModal();
      await cargarCategorias();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo guardar la categoría.");
        } else {
          setError(
            err.response.data.message || "No se pudo guardar la categoría."
          );
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoCategoria = async (categoria) => {
    const accion = categoria.estado ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} la categoría "${categoria.nombre_categoria}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(
        `/categorias/${categoria.id_categoria}/cambiar-estado`
      );

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarCategorias();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo cambiar el estado de la categoría."
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
          <h2>Cargando categorías...</h2>
          <p>Estamos obteniendo las categorías del catálogo.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Catálogo</span>
          <h1>Categorías</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            organizar los productos del catálogo de Dulce Mora.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarCategorias}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Categorías registradas</h2>
            <span>{categoriasFiltradas.length} categoría(s)</span>
          </div>

          <button className="nueva-categoria-btn" onClick={abrirCrearCategoria}>
            <FiPlus />
            Nueva categoría
          </button>
        </div>

        <div className="categorias-toolbar">
          <div className="search-box categorias-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {categoriasFiltradas.length === 0 ? (
          <p className="empty-text">No se encontraron categorías.</p>
        ) : (
          <div className="categorias-grid-admin">
            {categoriasFiltradas.map((categoria) => (
              <article
                className="categoria-admin-card"
                key={categoria.id_categoria}
              >
                <div className="categoria-icon">
                  <FiGrid />
                </div>

                <div className="categoria-body">
                  <div className="categoria-head">
                    {categoria.estado ? (
                      <span className="badge-estado">Activa</span>
                    ) : (
                      <span className="badge-inactivo">Inactiva</span>
                    )}
                  </div>

                  <h3>{categoria.nombre_categoria}</h3>

                  <p>
                    {categoria.descripcion ||
                      "Categoría sin descripción registrada."}
                  </p>

                  <div className="categoria-info">
                    <span>
                      <FiPackage />
                      {categoria.productos_count ?? 0} producto(s)
                    </span>
                  </div>

                  <div className="categoria-actions">
                    <button
                      type="button"
                      className="detalle-btn"
                      onClick={() => abrirEditarCategoria(categoria)}
                    >
                      <FiEdit2 />
                      Editar
                    </button>

                    <button
                      type="button"
                      className={categoria.estado ? "eliminar-btn" : "activar-btn"}
                      onClick={() => cambiarEstadoCategoria(categoria)}
                    >
                      {categoria.estado ? <FiTrash2 /> : <FiRefreshCw />}
                      {categoria.estado ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="cliente-modal categoria-modal">
            <div className="cliente-modal-head">
              <div>
                <span>
                  {categoriaEditando ? "Editar categoría" : "Nueva categoría"}
                </span>
                <h2>
                  {categoriaEditando
                    ? "Actualizar categoría"
                    : "Registrar categoría"}
                </h2>
              </div>

              <button type="button" onClick={cerrarModal}>
                <FiX />
              </button>
            </div>

            <form className="categoria-modal-form" onSubmit={guardarCategoria}>
              <label>
                Nombre de categoría *
                <input
                  type="text"
                  placeholder="Ej: Tortas"
                  value={formCategoria.nombre_categoria}
                  onChange={(e) =>
                    setFormCategoria({
                      ...formCategoria,
                      nombre_categoria: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label className="categoria-modal-full">
                Descripción
                <textarea
                  placeholder="Descripción breve de la categoría"
                  value={formCategoria.descripcion}
                  onChange={(e) =>
                    setFormCategoria({
                      ...formCategoria,
                      descripcion: e.target.value,
                    })
                  }
                />
              </label>

              <label className="cliente-check categoria-modal-full">
                <input
                  type="checkbox"
                  checked={formCategoria.estado}
                  onChange={(e) =>
                    setFormCategoria({
                      ...formCategoria,
                      estado: e.target.checked,
                    })
                  }
                />
                Categoría activa en el catálogo
              </label>

              <div className="cliente-modal-actions categoria-modal-actions">
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
                    : categoriaEditando
                    ? "Actualizar categoría"
                    : "Guardar categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Categorias;