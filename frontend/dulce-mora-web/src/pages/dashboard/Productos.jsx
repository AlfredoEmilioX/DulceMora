import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../../styles/dashboard/productos.css";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiImage,
  FiTag,
  FiBox,
  FiFileText,
  FiDownload,
} from "react-icons/fi";

function Productos() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroImagen, setFiltroImagen] = useState("todos");
  const [filtroStock, setFiltroStock] = useState("todos");

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [formProducto, setFormProducto] = useState({
    id_categoria: "",
    nombre_producto: "",
    descripcion: "",
    precio: "",
    imagen: "",
    estado: true,
  });

  const normalizarLista = (data, clavePrincipal = "") => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (clavePrincipal && Array.isArray(data?.[clavePrincipal])) {
      return data[clavePrincipal];
    }
    if (Array.isArray(data?.productos)) return data.productos;
    if (Array.isArray(data?.categorias)) return data.categorias;

    return [];
  };

  const formatoSoles = (monto) => {
    return `S/ ${Number(monto ?? 0).toFixed(2)}`;
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      setMensaje("");

      const productosRes = await api.get("/productos");
      const listaProductos = normalizarLista(productosRes.data, "productos");

      setProductos(listaProductos);

      try {
        const categoriasRes = await api.get("/categorias");
        const listaCategorias = normalizarLista(
          categoriasRes.data,
          "categorias"
        );

        setCategorias(listaCategorias);
      } catch (categoriaError) {
        console.error("Error cargando categorías:", categoriaError);
        setCategorias([]);
      }
    } catch (err) {
      console.error("Error cargando productos:", err);
      setProductos([]);
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const calcularStockTotal = (producto) => {
    if (!producto.stock || producto.stock.length === 0) return 0;

    return producto.stock.reduce((total, item) => {
      return total + Number(item.cantidad ?? 0);
    }, 0);
  };

  const obtenerCategoriaNombre = (producto) => {
    return (
      producto.categoria?.nombre_categoria ||
      producto.categoria?.nombre ||
      "Sin categoría"
    );
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const nombre = String(producto.nombre_producto ?? "").toLowerCase();
      const descripcion = String(producto.descripcion ?? "").toLowerCase();
      const categoria = String(obtenerCategoriaNombre(producto)).toLowerCase();
      const stockTotal = calcularStockTotal(producto);

      const productoActivo =
        producto.estado === true ||
        producto.estado === 1 ||
        producto.estado === "1";

      const coincideBusqueda =
        !texto ||
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoria.includes(texto);

      const coincideCategoria =
        filtroCategoria === "todas" ||
        String(producto.id_categoria) === String(filtroCategoria);

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activo" && productoActivo) ||
        (filtroEstado === "inactivo" && !productoActivo);

      const coincideImagen =
        filtroImagen === "todos" ||
        (filtroImagen === "con_imagen" && producto.imagen) ||
        (filtroImagen === "sin_imagen" && !producto.imagen);

      const coincideStock =
        filtroStock === "todos" ||
        (filtroStock === "con_stock" && stockTotal > 0) ||
        (filtroStock === "sin_stock" && stockTotal === 0) ||
        (filtroStock === "stock_bajo" && stockTotal > 0 && stockTotal <= 5);

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideEstado &&
        coincideImagen &&
        coincideStock
      );
    });
  }, [
    productos,
    busqueda,
    filtroCategoria,
    filtroEstado,
    filtroImagen,
    filtroStock,
  ]);

  const limpiarFiltrosReporte = () => {
    setBusqueda("");
    setFiltroCategoria("todas");
    setFiltroEstado("todos");
    setFiltroImagen("todos");
    setFiltroStock("todos");
  };

  const limpiarFormulario = () => {
    setProductoEditando(null);

    setFormProducto({
      id_categoria: "",
      nombre_producto: "",
      descripcion: "",
      precio: "",
      imagen: "",
      estado: true,
    });
  };

  const abrirCrearProducto = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalAbierto(true);
  };

  const abrirEditarProducto = (producto) => {
    setMensaje("");
    setError("");
    setProductoEditando(producto);

    setFormProducto({
      id_categoria: producto.id_categoria || "",
      nombre_producto: producto.nombre_producto || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      imagen: producto.imagen || "",
      estado:
        producto.estado === true ||
        producto.estado === 1 ||
        producto.estado === "1",
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiarFormulario();
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formProducto.id_categoria) {
      setError("Debes seleccionar una categoría.");
      return;
    }

    if (!formProducto.nombre_producto.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (!formProducto.precio || Number(formProducto.precio) < 0) {
      setError("El precio debe ser válido.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        id_categoria: Number(formProducto.id_categoria),
        nombre_producto: formProducto.nombre_producto,
        descripcion: formProducto.descripcion || null,
        precio: Number(formProducto.precio),
        imagen: formProducto.imagen || null,
        estado: formProducto.estado,
      };

      if (productoEditando) {
        await api.put(`/productos/${productoEditando.id_producto}`, payload);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await api.post("/productos", payload);
        setMensaje("Producto registrado correctamente.");
      }

      cerrarModal();
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo guardar el producto.");
        } else {
          setError(
            err.response.data.message || "No se pudo guardar el producto."
          );
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoProducto = async (producto) => {
    const productoActivo =
      producto.estado === true ||
      producto.estado === 1 ||
      producto.estado === "1";

    const accion = productoActivo ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} "${producto.nombre_producto}"?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      const response = await api.patch(
        `/productos/${producto.id_producto}/cambiar-estado`
      );

      setMensaje(response.data.message || "Estado actualizado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(
          err.response.data.message ||
            "No se pudo cambiar el estado del producto."
        );
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  const exportarExcel = () => {
    if (productosFiltrados.length === 0) {
      alert("No hay productos para exportar.");
      return;
    }

    const filas = productosFiltrados.map((producto) => {
      const productoActivo =
        producto.estado === true ||
        producto.estado === 1 ||
        producto.estado === "1";

      return {
        ID: producto.id_producto,
        Producto: producto.nombre_producto || "",
        Categoria: obtenerCategoriaNombre(producto),
        Descripcion: producto.descripcion || "",
        Precio: Number(producto.precio ?? 0).toFixed(2),
        Stock: calcularStockTotal(producto),
        Estado: productoActivo ? "Activo" : "Inactivo",
        Imagen: producto.imagen ? "Con imagen" : "Sin imagen",
      };
    });

    const encabezados = Object.keys(filas[0]);

    const contenido = [
      encabezados.join(";"),
      ...filas.map((fila) =>
        encabezados
          .map((encabezado) =>
            `"${String(fila[encabezado]).replace(/"/g, '""')}"`
          )
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const enlace = document.createElement("a");
    const url = URL.createObjectURL(blob);

    enlace.href = url;
    enlace.download = "reporte_productos_dulce_mora.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    if (productosFiltrados.length === 0) {
      alert("No hay productos para exportar.");
      return;
    }

    const filas = productosFiltrados
      .map((producto) => {
        const productoActivo =
          producto.estado === true ||
          producto.estado === 1 ||
          producto.estado === "1";

        return `
          <tr>
            <td>#${producto.id_producto}</td>
            <td>${producto.nombre_producto || ""}</td>
            <td>${obtenerCategoriaNombre(producto)}</td>
            <td>${producto.descripcion || "—"}</td>
            <td>${formatoSoles(producto.precio)}</td>
            <td>${calcularStockTotal(producto)}</td>
            <td>${productoActivo ? "Activo" : "Inactivo"}</td>
            <td>${producto.imagen ? "Con imagen" : "Sin imagen"}</td>
          </tr>
        `;
      })
      .join("");

    const ventana = window.open("", "_blank");

    if (!ventana) {
      alert("El navegador bloqueó la ventana emergente del PDF.");
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte de productos</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #351b42;
            }

            h1 {
              color: #d7659b;
              margin-bottom: 5px;
            }

            p {
              margin-top: 0;
              color: #72546c;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }

            th {
              background: #d7659b;
              color: white;
              padding: 8px;
              text-align: left;
            }

            td {
              border: 1px solid #f0bfd6;
              padding: 8px;
              vertical-align: top;
            }
          </style>
        </head>

        <body>
          <h1>Dulce Mora</h1>
          <p>Reporte de productos registrados</p>
          <p>Total de productos: ${productosFiltrados.length}</p>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Imagen</th>
              </tr>
            </thead>

            <tbody>
              ${filas}
            </tbody>
          </table>
        </body>
      </html>
    `);

    ventana.document.close();
    ventana.print();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando productos...</h2>
          <p>Estamos obteniendo el catálogo de Dulce Mora.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Catálogo</span>
          <h1>Productos</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres || "Admin"}</strong>. Aquí
            puedes registrar, editar, controlar y generar reportes del catálogo.
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
            <h2>Productos registrados</h2>
            <span>{productosFiltrados.length} producto(s)</span>
          </div>

          <button className="nuevo-producto-btn" onClick={abrirCrearProducto}>
            <FiPlus />
            Nuevo producto
          </button>
        </div>

        <div className="productos-toolbar">
          <div className="search-box productos-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por producto, categoría o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="productos-reporte-panel">
          <div className="productos-reporte-head">
            <div>
              <h3>Reporte de productos</h3>
              <p>
                Filtra los productos registrados y genera un reporte en Excel o
                PDF.
              </p>
            </div>

            <div className="productos-reporte-actions">
              <button type="button" onClick={exportarExcel}>
                <FiDownload />
                Exportar Excel
              </button>

              <button type="button" onClick={exportarPDF}>
                <FiFileText />
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="productos-reporte-filtros">
            <label>
              Categoría
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="todas">Todas</option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id_categoria}
                    value={categoria.id_categoria}
                  >
                    {categoria.nombre_categoria || categoria.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Estado
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </label>

            <label>
              Imagen
              <select
                value={filtroImagen}
                onChange={(e) => setFiltroImagen(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="con_imagen">Con imagen</option>
                <option value="sin_imagen">Sin imagen</option>
              </select>
            </label>

            <label>
              Stock
              <select
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="con_stock">Con stock</option>
                <option value="sin_stock">Sin stock</option>
                <option value="stock_bajo">Stock bajo</option>
              </select>
            </label>

            <button type="button" onClick={limpiarFiltrosReporte}>
              Limpiar filtros
            </button>
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <p className="empty-text">No se encontraron productos.</p>
        ) : (
          <div className="productos-grid-admin">
            {productosFiltrados.map((producto) => {
              const productoActivo =
                producto.estado === true ||
                producto.estado === 1 ||
                producto.estado === "1";

              return (
                <article
                  className="producto-admin-card"
                  key={producto.id_producto}
                >
                  <div className="producto-admin-imagen">
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre_producto}
                      />
                    ) : (
                      <div>
                        <FiImage />
                        <span>Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <div className="producto-admin-body">
                    <div className="producto-admin-head">
                      <span className="producto-categoria">
                        <FiTag />
                        {obtenerCategoriaNombre(producto)}
                      </span>

                      {productoActivo ? (
                        <span className="badge-estado">Activo</span>
                      ) : (
                        <span className="badge-inactivo">Inactivo</span>
                      )}
                    </div>

                    <h3>{producto.nombre_producto}</h3>

                    <p>
                      {producto.descripcion ||
                        "Producto sin descripción registrada."}
                    </p>

                    <div className="producto-admin-info">
                      <div>
                        <small>Precio</small>
                        <strong>{formatoSoles(producto.precio)}</strong>
                      </div>

                      <div>
                        <small>Stock total</small>
                        <strong>
                          <FiBox />
                          {calcularStockTotal(producto)}
                        </strong>
                      </div>
                    </div>

                    {producto.stock && producto.stock.length > 0 && (
                      <div className="producto-stock-lista">
                        {producto.stock.map((item) => (
                          <span key={item.id_stock}>
                            {item.sede?.nombre_comercial || "Sede"}:{" "}
                            <strong>{item.cantidad}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="producto-admin-actions">
                      <button
                        type="button"
                        className="detalle-btn"
                        onClick={() => abrirEditarProducto(producto)}
                      >
                        <FiEdit2 />
                        Editar
                      </button>

                      <button
                        type="button"
                        className={
                          productoActivo ? "eliminar-btn" : "activar-btn"
                        }
                        onClick={() => cambiarEstadoProducto(producto)}
                      >
                        {productoActivo ? <FiTrash2 /> : <FiRefreshCw />}
                        {productoActivo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="cliente-modal producto-modal">
            <div className="cliente-modal-head">
              <div>
                <span>
                  {productoEditando ? "Editar producto" : "Nuevo producto"}
                </span>
                <h2>
                  {productoEditando
                    ? "Actualizar producto"
                    : "Registrar producto"}
                </h2>
              </div>

              <button type="button" onClick={cerrarModal}>
                <FiX />
              </button>
            </div>

            <form className="producto-modal-form" onSubmit={guardarProducto}>
              <label>
                Categoría *
                <select
                  value={formProducto.id_categoria}
                  onChange={(e) =>
                    setFormProducto({
                      ...formProducto,
                      id_categoria: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seleccionar categoría</option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id_categoria}
                      value={categoria.id_categoria}
                    >
                      {categoria.nombre_categoria || categoria.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nombre del producto *
                <input
                  type="text"
                  placeholder="Ej: Torta de Chocolate"
                  value={formProducto.nombre_producto}
                  onChange={(e) =>
                    setFormProducto({
                      ...formProducto,
                      nombre_producto: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Precio *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 110.00"
                  value={formProducto.precio}
                  onChange={(e) =>
                    setFormProducto({
                      ...formProducto,
                      precio: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Imagen URL
                <input
                  type="text"
                  placeholder="/img/producto.jpg o URL"
                  value={formProducto.imagen}
                  onChange={(e) =>
                    setFormProducto({
                      ...formProducto,
                      imagen: e.target.value,
                    })
                  }
                />
              </label>

              <label className="producto-modal-full">
                Descripción
                <textarea
                  placeholder="Descripción breve del producto"
                  value={formProducto.descripcion}
                  onChange={(e) =>
                    setFormProducto({
                      ...formProducto,
                      descripcion: e.target.value,
                    })
                  }
                />
              </label>

              <label className="cliente-check producto-modal-full">
                <input
                  type="checkbox"
                  checked={formProducto.estado}
                  onChange={(e) =>
                    setFormProducto({
                      ...formProducto,
                      estado: e.target.checked,
                    })
                  }
                />
                Producto activo en el catálogo
              </label>

              <div className="cliente-modal-actions producto-modal-actions">
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
                    : productoEditando
                    ? "Actualizar producto"
                    : "Guardar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Productos;