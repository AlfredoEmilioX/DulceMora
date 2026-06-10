import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiPlus,
  FiMinus,
  FiTrash2,
  FiShoppingCart,
  FiSearch,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiX,
} from "react-icons/fi";

function Ventas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [stock, setStock] = useState([]);

  const [idSede, setIdSede] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [guardandoCliente, setGuardandoCliente] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    dni: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    email: "",
    fecha_nacimiento: "",
    direccion: "",
    acepta_promociones: true,
  });

  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [descuento, setDescuento] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");


  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const [productosRes, clientesRes, sedesRes, stockRes] =
        await Promise.all([
          api.get("/productos"),
          api.get("/clientes"),
          api.get("/sedes"),
          api.get("/stock"),
        ]);

      setProductos(productosRes.data);
      setClientes(clientesRes.data);
      setSedes(sedesRes.data);
      setStock(stockRes.data);

      if (sedesRes.data.length > 0 && !idSede) {
        setIdSede(sedesRes.data[0].id_sede);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos para ventas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesFiltrados = useMemo(() => {
    const texto = busquedaCliente.trim().toLowerCase();

    if (texto.length < 2 || clienteSeleccionado) {
      return [];
    }

    return clientes
      .filter((cliente) => {
        const nombreCompleto = `${cliente.nombres ?? ""} ${
          cliente.apellidos ?? ""
        }`.toLowerCase();

        const dni = String(cliente.dni ?? "").toLowerCase();
        const documento = String(cliente.documento ?? "").toLowerCase();
        const telefono = String(cliente.telefono ?? "").toLowerCase();
        const email = String(cliente.email ?? "").toLowerCase();

        return (
          nombreCompleto.includes(texto) ||
          dni.includes(texto) ||
          documento.includes(texto) ||
          telefono.includes(texto) ||
          email.includes(texto)
        );
      })
      .slice(0, 5);
  }, [clientes, busquedaCliente, clienteSeleccionado]);

  const productosDisponibles = useMemo(() => {
    if (!idSede) return [];

    return productos
      .map((producto) => {
        const stockProducto = stock.find(
          (item) =>
            Number(item.id_producto) === Number(producto.id_producto) &&
            Number(item.id_sede) === Number(idSede)
        );

        return {
          ...producto,
          cantidad_stock: stockProducto ? Number(stockProducto.cantidad) : 0,
          stock_minimo: stockProducto ? Number(stockProducto.stock_minimo) : 0,
        };
      })
      .filter((producto) => producto.estado === true || producto.estado === 1)
      .filter((producto) =>
        producto.nombre_producto
          ?.toLowerCase()
          .includes(busqueda.toLowerCase())
      );
  }, [productos, stock, idSede, busqueda]);

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(`${cliente.nombres} ${cliente.apellidos ?? ""}`);
  };

  const quitarCliente = () => {
    setClienteSeleccionado(null);
    setBusquedaCliente("");
  };

  const abrirNuevoCliente = () => {
    setMensaje("");
    setError("");
    setMostrarNuevoCliente(true);

    if (/^\d{8}$/.test(busquedaCliente.trim())) {
      setNuevoCliente((prev) => ({
        ...prev,
        dni: busquedaCliente.trim(),
      }));
    }
  };

  const cerrarModalCliente = () => {
    setMostrarNuevoCliente(false);
  };

  const guardarNuevoCliente = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!nuevoCliente.nombres.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    try {
      setGuardandoCliente(true);

      const payload = {
        dni: nuevoCliente.dni || null,
        documento: nuevoCliente.dni || null,
        nombres: nuevoCliente.nombres,
        apellidos: nuevoCliente.apellidos || null,
        telefono: nuevoCliente.telefono || null,
        email: nuevoCliente.email || null,
        fecha_nacimiento: nuevoCliente.fecha_nacimiento || null,
        direccion: nuevoCliente.direccion || null,
        acepta_promociones: nuevoCliente.acepta_promociones,
        estado: true,
      };

      const response = await api.post("/clientes", payload);

      const clienteCreado = response.data.data;

      setClientes((prev) => [...prev, clienteCreado]);
      setClienteSeleccionado(clienteCreado);
      setBusquedaCliente(
        `${clienteCreado.nombres} ${clienteCreado.apellidos ?? ""}`
      );

      setNuevoCliente({
        dni: "",
        nombres: "",
        apellidos: "",
        telefono: "",
        email: "",
        fecha_nacimiento: "",
        direccion: "",
        acepta_promociones: true,
      });

      setMostrarNuevoCliente(false);
      setMensaje("Cliente registrado correctamente.");
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo registrar el cliente.");
        } else {
          setError(err.response.data.message || "No se pudo registrar el cliente.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardandoCliente(false);
    }
  };

  const agregarProducto = (producto) => {
    setMensaje("");
    setError("");

    if (producto.cantidad_stock <= 0) {
      setError("Este producto no tiene stock disponible en la sede seleccionada.");
      return;
    }

    const existe = carrito.find(
      (item) => Number(item.id_producto) === Number(producto.id_producto)
    );

    if (existe) {
      aumentarCantidad(producto.id_producto);
      return;
    }

    setCarrito([
      ...carrito,
      {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_unitario: Number(producto.precio),
        cantidad: 1,
        stock_disponible: producto.cantidad_stock,
      },
    ]);
  };

  const aumentarCantidad = (idProducto) => {
    setCarrito((items) =>
      items.map((item) => {
        if (Number(item.id_producto) === Number(idProducto)) {
          if (item.cantidad >= item.stock_disponible) {
            setError("No hay más stock disponible para este producto.");
            return item;
          }

          return {
            ...item,
            cantidad: item.cantidad + 1,
          };
        }

        return item;
      })
    );
  };

  const disminuirCantidad = (idProducto) => {
    setCarrito((items) =>
      items.map((item) => {
        if (Number(item.id_producto) === Number(idProducto)) {
          return {
            ...item,
            cantidad: item.cantidad > 1 ? item.cantidad - 1 : 1,
          };
        }

        return item;
      })
    );
  };

  const eliminarProducto = (idProducto) => {
    setCarrito((items) =>
      items.filter((item) => Number(item.id_producto) !== Number(idProducto))
    );
  };

  const subtotal = carrito.reduce(
    (total, item) => total + item.precio_unitario * item.cantidad,
    0
  );

  const descuentoNumero = Number(descuento) || 0;
  const total = subtotal - descuentoNumero;

  const registrarVenta = async () => {
    setMensaje("");
    setError("");

    if (!idSede) {
      setError("Selecciona una sede.");
      return;
    }

    if (carrito.length === 0) {
      setError("Agrega al menos un producto al carrito.");
      return;
    }

    if (total < 0) {
      setError("El descuento no puede ser mayor al subtotal.");
      return;
    }

    try {
      setProcesando(true);

      const payload = {
        id_cliente: clienteSeleccionado
          ? Number(clienteSeleccionado.id_cliente)
          : null,
        id_sede: Number(idSede),
        metodo_pago: metodoPago,
        descuento: descuentoNumero,
        detalles: carrito.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
        })),
      };

      const response = await api.post("/ventas-completa", payload);

      setMensaje(response.data.message || "Venta registrada correctamente.");
      setCarrito([]);
      setDescuento(0);
      setClienteSeleccionado(null);
      setBusquedaCliente("");

      await cargarDatos();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudo registrar la venta.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando ventas...</h2>
          <p>Estamos preparando el módulo de caja.</p>
        </div>
      </div>
    );
  }

  return (
    <>
        <header className="dashboard-header">
          <div>
            <span className="dashboard-kicker">Caja / ventas</span>
            <h1>Registrar venta</h1>
            <p>
              Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
              vender productos y descontar stock automáticamente.
            </p>
          </div>

          <button className="refresh-button" onClick={cargarDatos}>
            Actualizar
          </button>
        </header>

        {mensaje && <div className="venta-success">{mensaje}</div>}
        {error && <div className="dashboard-error">{error}</div>}

        <section className="ventas-layout">
          <div className="ventas-panel">
            <div className="report-card">
              <div className="report-head">
                <h2>Datos de venta</h2>
                <span>Información principal</span>
              </div>

              <div className="venta-form-grid">
                <label>
                  <span>
                    <FiMapPin /> Sede
                  </span>
                  <select
                    value={idSede}
                    onChange={(e) => {
                      setIdSede(e.target.value);
                      setCarrito([]);
                    }}
                  >
                    {sedes.map((sede) => (
                      <option key={sede.id_sede} value={sede.id_sede}>
                        {sede.nombre_comercial}
                      </option>
                    ))}
                  </select>
                </label>

                  <label className="cliente-buscador-label cliente-minimal">
                    <span>
                        <FiUser /> Cliente
                    </span>

                    <button
                        type="button"
                        className="nuevo-cliente-btn"
                        onClick={abrirNuevoCliente}
                    >
                        <FiPlus />
                        Nuevo cliente
                    </button>

                    <small className="cliente-ayuda">
                        Puedes dejarlo vacío para venta sin cliente.
                    </small>

                    <div className="cliente-buscador">
                        <input
                        type="text"
                        placeholder="Buscar DNI, nombre o teléfono..."
                        value={busquedaCliente}
                        onChange={(e) => {
                            setBusquedaCliente(e.target.value);
                            setClienteSeleccionado(null);
                        }}
                        />

                        {clienteSeleccionado && (
                        <button
                            type="button"
                            className="cliente-clear"
                            onClick={quitarCliente}
                            title="Quitar cliente"
                        >
                            <FiX />
                        </button>
                        )}

                        {clientesFiltrados.length > 0 && (
                        <div className="cliente-resultados">
                            {clientesFiltrados.map((cliente) => (
                            <button
                                type="button"
                                key={cliente.id_cliente}
                                onClick={() => seleccionarCliente(cliente)}
                            >
                                <strong>
                                {cliente.nombres} {cliente.apellidos}
                                </strong>
                                <small>
                                DNI: {cliente.dni || cliente.documento || "Sin DNI"} ·{" "}
                                Tel: {cliente.telefono || "Sin teléfono"}
                                </small>
                            </button>
                            ))}
                        </div>
                        )}
                    </div>
                    </label>  

                <label>
                  <span>
                    <FiDollarSign /> Método de pago
                  </span>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </label>

                <label>
                  <span>Descuento</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="report-card">
              <div className="report-head">
                <h2>Productos disponibles</h2>
                <span>{productosDisponibles.length} productos</span>
              </div>

              <div className="search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="ventas-productos-grid">
                {productosDisponibles.map((producto) => (
                  <article
                    className="venta-producto-card"
                    key={producto.id_producto}
                  >
                    <div className="venta-producto-img">
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre_producto}
                        />
                      ) : (
                        <span>{producto.nombre_producto}</span>
                      )}
                    </div>

                    <div className="venta-producto-info">
                      <h3>{producto.nombre_producto}</h3>
                      <p>{producto.descripcion}</p>

                      <div className="venta-producto-bottom">
                        <strong>S/ {Number(producto.precio).toFixed(2)}</strong>
                        <small>Stock: {producto.cantidad_stock}</small>
                      </div>

                      <button
                        type="button"
                        onClick={() => agregarProducto(producto)}
                      >
                        <FiPlus />
                        Agregar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="carrito-panel">
            <div className="report-card carrito-card">
              <div className="report-head">
                <h2>
                  <FiShoppingCart /> Carrito
                </h2>
                <span>{carrito.length} productos</span>
              </div>

              {carrito.length === 0 ? (
                <p className="empty-text">
                  Todavía no agregaste productos a la venta.
                </p>
              ) : (
                <div className="carrito-lista">
                  {carrito.map((item) => (
                    <div className="carrito-item" key={item.id_producto}>
                      <div>
                        <h4>{item.nombre_producto}</h4>
                        <p>S/ {item.precio_unitario.toFixed(2)} c/u</p>
                        <small>Stock disponible: {item.stock_disponible}</small>
                      </div>

                      <div className="cantidad-control">
                        <button
                          type="button"
                          onClick={() => disminuirCantidad(item.id_producto)}
                        >
                          <FiMinus />
                        </button>

                        <span>{item.cantidad}</span>

                        <button
                          type="button"
                          onClick={() => aumentarCantidad(item.id_producto)}
                        >
                          <FiPlus />
                        </button>
                      </div>

                      <strong>
                        S/ {(item.precio_unitario * item.cantidad).toFixed(2)}
                      </strong>

                      <button
                        type="button"
                        className="delete-item"
                        onClick={() => eliminarProducto(item.id_producto)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="venta-totales">
                <div>
                  <span>Subtotal</span>
                  <strong>S/ {subtotal.toFixed(2)}</strong>
                </div>

                <div>
                  <span>Descuento</span>
                  <strong>S/ {descuentoNumero.toFixed(2)}</strong>
                </div>

                <div className="total-final">
                  <span>Total</span>
                  <strong>S/ {total.toFixed(2)}</strong>
                </div>
              </div>

              <button
                className="registrar-venta-btn"
                type="button"
                disabled={procesando || carrito.length === 0}
                onClick={registrarVenta}
              >
                {procesando ? "Registrando..." : "Registrar venta"}
              </button>
            </div>
          </aside>
        </section>

        {mostrarNuevoCliente && (
          <div className="modal-overlay">
            <div className="cliente-modal">
              <div className="cliente-modal-head">
                <div>
                  <span>Registro rápido</span>
                  <h2>Nuevo cliente</h2>
                </div>

                <button type="button" onClick={cerrarModalCliente}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={guardarNuevoCliente} className="cliente-modal-form">
                <label>
                  DNI
                  <input
                    type="text"
                    maxLength="8"
                    placeholder="Ej: 71234567"
                    value={nuevoCliente.dni}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        dni: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </label>

                <label>
                  Nombres *
                  <input
                    type="text"
                    placeholder="Ej: Ana"
                    value={nuevoCliente.nombres}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
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
                    placeholder="Ej: Torres Huamán"
                    value={nuevoCliente.apellidos}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        apellidos: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Teléfono
                  <input
                    type="text"
                    maxLength="9"
                    placeholder="Ej: 987654321"
                    value={nuevoCliente.telefono}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        telefono: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    placeholder="cliente@example.com"
                    value={nuevoCliente.email}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        email: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Fecha de nacimiento
                  <input
                    type="date"
                    value={nuevoCliente.fecha_nacimiento}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="cliente-modal-full">
                  Dirección
                  <input
                    type="text"
                    placeholder="Dirección del cliente"
                    value={nuevoCliente.direccion}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        direccion: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="cliente-check cliente-modal-full">
                  <input
                    type="checkbox"
                    checked={nuevoCliente.acepta_promociones}
                    onChange={(e) =>
                      setNuevoCliente({
                        ...nuevoCliente,
                        acepta_promociones: e.target.checked,
                      })
                    }
                  />
                  Acepta recibir promociones y descuentos por cumpleaños
                </label>

                <div className="cliente-modal-actions">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={cerrarModalCliente}
                  >
                    Cancelar
                  </button>

                  <button type="submit" disabled={guardandoCliente}>
                    {guardandoCliente ? "Guardando..." : "Guardar cliente"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}

export default Ventas;