import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiGift,
} from "react-icons/fi";

function Clientes() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [formCliente, setFormCliente] = useState({
    dni: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    email: "",
    fecha_nacimiento: "",
    direccion: "",
    acepta_promociones: true,
    estado: true,
  });

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clientes");
      setClientes(response.data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return clientes;

    return clientes.filter((cliente) => {
      const nombreCompleto = `${cliente.nombres ?? ""} ${
        cliente.apellidos ?? ""
      }`.toLowerCase();

      const dni = String(cliente.dni ?? cliente.documento ?? "").toLowerCase();
      const telefono = String(cliente.telefono ?? "").toLowerCase();
      const email = String(cliente.email ?? "").toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        dni.includes(texto) ||
        telefono.includes(texto) ||
        email.includes(texto)
      );
    });
  }, [clientes, busqueda]);

  const limpiarFormulario = () => {
    setFormCliente({
      dni: "",
      nombres: "",
      apellidos: "",
      telefono: "",
      email: "",
      fecha_nacimiento: "",
      direccion: "",
      acepta_promociones: true,
      estado: true,
    });

    setClienteEditando(null);
  };

  const abrirCrearCliente = () => {
    setMensaje("");
    setError("");
    limpiarFormulario();
    setModalAbierto(true);
  };

  const abrirEditarCliente = (cliente) => {
    setMensaje("");
    setError("");
    setClienteEditando(cliente);

    setFormCliente({
      dni: cliente.dni || cliente.documento || "",
      nombres: cliente.nombres || "",
      apellidos: cliente.apellidos || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      fecha_nacimiento: cliente.fecha_nacimiento
        ? String(cliente.fecha_nacimiento).substring(0, 10)
        : "",
      direccion: cliente.direccion || "",
      acepta_promociones:
        cliente.acepta_promociones === true ||
        cliente.acepta_promociones === 1,
      estado: cliente.estado === true || cliente.estado === 1,
    });

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiarFormulario();
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!formCliente.nombres.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        dni: formCliente.dni || null,
        documento: formCliente.dni || null,
        nombres: formCliente.nombres,
        apellidos: formCliente.apellidos || null,
        telefono: formCliente.telefono || null,
        email: formCliente.email || null,
        fecha_nacimiento: formCliente.fecha_nacimiento || null,
        direccion: formCliente.direccion || null,
        acepta_promociones: formCliente.acepta_promociones,
        estado: formCliente.estado,
      };

      if (clienteEditando) {
        await api.put(`/clientes/${clienteEditando.id_cliente}`, payload);
        setMensaje("Cliente actualizado correctamente.");
      } else {
        await api.post("/clientes", payload);
        setMensaje("Cliente registrado correctamente.");
      }

      cerrarModal();
      await cargarClientes();
    } catch (err) {
      console.error(err);

      if (err.response) {
        const errores = err.response.data.errors;

        if (errores) {
          const primerError = Object.values(errores)[0]?.[0];
          setError(primerError || "No se pudo guardar el cliente.");
        } else {
          setError(err.response.data.message || "No se pudo guardar el cliente.");
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCliente = async (cliente) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar a ${cliente.nombres} ${cliente.apellidos ?? ""}?`
    );

    if (!confirmar) return;

    try {
      setMensaje("");
      setError("");

      await api.delete(`/clientes/${cliente.id_cliente}`);
      setMensaje("Cliente eliminado correctamente.");
      await cargarClientes();
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError(err.response.data.message || "No se pudo eliminar el cliente.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    }
  };

  const cumpleanosTexto = (fecha) => {
    if (!fecha) return "No registrado";

    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-card">
          <h2>Cargando clientes...</h2>
          <p>Estamos obteniendo la información registrada.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <span className="dashboard-kicker">Gestión comercial</span>
          <h1>Clientes</h1>
          <p>
            Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí puedes
            registrar clientes, controlar cumpleaños y gestionar promociones.
          </p>
        </div>

        <button className="refresh-button" onClick={cargarClientes}>
          <FiRefreshCw />
          Actualizar
        </button>
      </header>

      {mensaje && <div className="venta-success">{mensaje}</div>}
      {error && <div className="dashboard-error">{error}</div>}

      <section className="report-card full-card">
        <div className="report-head">
          <div>
            <h2>Clientes registrados</h2>
            <span>{clientesFiltrados.length} cliente(s)</span>
          </div>

          <button className="nuevo-cliente-admin-btn" onClick={abrirCrearCliente}>
            <FiPlus />
            Nuevo cliente
          </button>
        </div>

        <div className="clientes-toolbar">
          <div className="search-box clientes-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre, teléfono o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {clientesFiltrados.length === 0 ? (
          <p className="empty-text">No se encontraron clientes.</p>
        ) : (
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Cumpleaños</th>
                  <th>Promociones</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id_cliente}>
                    <td>#{cliente.id_cliente}</td>
                    <td>{cliente.dni || cliente.documento || "Sin DNI"}</td>
                    <td>
                      <strong>
                        {cliente.nombres} {cliente.apellidos}
                      </strong>
                    </td>
                    <td>{cliente.telefono || "No registrado"}</td>
                    <td>{cliente.email || "No registrado"}</td>
                    <td>
                      <span className="cumpleanos-badge">
                        <FiGift />
                        {cumpleanosTexto(cliente.fecha_nacimiento)}
                      </span>
                    </td>
                    <td>
                      {cliente.acepta_promociones ? (
                        <span className="badge-estado">Acepta</span>
                      ) : (
                        <span className="badge-inactivo">No acepta</span>
                      )}
                    </td>
                    <td>
                      {cliente.estado ? (
                        <span className="badge-estado">Activo</span>
                      ) : (
                        <span className="badge-inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="acciones-tabla">
                        <button
                          type="button"
                          className="detalle-btn"
                          onClick={() => abrirEditarCliente(cliente)}
                        >
                          <FiEdit2 />
                          Editar
                        </button>

                        <button
                          type="button"
                          className="eliminar-btn"
                          onClick={() => eliminarCliente(cliente)}
                        >
                          <FiTrash2 />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="cliente-modal">
            <div className="cliente-modal-head">
              <div>
                <span>{clienteEditando ? "Editar cliente" : "Nuevo cliente"}</span>
                <h2>{clienteEditando ? "Actualizar cliente" : "Registrar cliente"}</h2>
              </div>

              <button type="button" onClick={cerrarModal}>
                <FiX />
              </button>
            </div>

            <form className="cliente-modal-form" onSubmit={guardarCliente}>
              <label>
                DNI
                <input
                  type="text"
                  maxLength="8"
                  placeholder="Ej: 71234567"
                  value={formCliente.dni}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
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
                  value={formCliente.nombres}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
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
                  value={formCliente.apellidos}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
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
                  value={formCliente.telefono}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
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
                  value={formCliente.email}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
                      email: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Fecha de nacimiento
                <input
                  type="date"
                  value={formCliente.fecha_nacimiento}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
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
                  value={formCliente.direccion}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
                      direccion: e.target.value,
                    })
                  }
                />
              </label>

              <label className="cliente-check cliente-modal-full">
                <input
                  type="checkbox"
                  checked={formCliente.acepta_promociones}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
                      acepta_promociones: e.target.checked,
                    })
                  }
                />
                Acepta recibir promociones y descuentos por cumpleaños
              </label>

              <label className="cliente-check cliente-modal-full">
                <input
                  type="checkbox"
                  checked={formCliente.estado}
                  onChange={(e) =>
                    setFormCliente({
                      ...formCliente,
                      estado: e.target.checked,
                    })
                  }
                />
                Cliente activo
              </label>

              <div className="cliente-modal-actions">
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
                    : clienteEditando
                    ? "Actualizar cliente"
                    : "Guardar cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Clientes;