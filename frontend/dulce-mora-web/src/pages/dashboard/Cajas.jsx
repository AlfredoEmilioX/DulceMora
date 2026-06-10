import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../../styles/dashboard/cajas.css";


export default function Cajas() {
  const [cajas, setCajas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [resumen, setResumen] = useState({
    total_cajas: 0,
    cajas_abiertas: 0,
    cajas_cerradas: 0,
    monto_total_actual: 0,
  });

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [modalCaja, setModalCaja] = useState(false);
  const [modalCerrar, setModalCerrar] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);

  const [formCaja, setFormCaja] = useState({
    id_sede: "",
    id_usuario: "",
    monto_inicial: "",
    observacion: "",
  });

  const [formCierre, setFormCierre] = useState({
    monto_final: "",
    observacion: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [cajasRes, resumenRes, sedesRes, usuariosRes] =
        await Promise.all([
          api.get("/cajas"),
          api.get("/cajas/resumen"),
          api.get("/sedes"),
          api.get("/usuarios"),
        ]);

      setCajas(Array.isArray(cajasRes.data) ? cajasRes.data : []);
      setResumen(resumenRes.data || {});
      setSedes(Array.isArray(sedesRes.data) ? sedesRes.data : []);
      setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : []);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los datos de cajas.");
    } finally {
      setCargando(false);
    }
  };

  const cajasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return cajas;

    return cajas.filter((caja) => {
      const id = String(caja.id_caja || "");
      const sede = caja.sede?.nombre || "";
      const usuario = `${caja.usuario?.nombres || ""} ${
        caja.usuario?.apellidos || ""
      }`;
      const estado = caja.estado_caja || "";

      return (
        id.includes(texto) ||
        sede.toLowerCase().includes(texto) ||
        usuario.toLowerCase().includes(texto) ||
        estado.toLowerCase().includes(texto)
      );
    });
  }, [busqueda, cajas]);

  const abrirNuevaCaja = () => {
    setModoEditar(false);
    setCajaSeleccionada(null);
    setFormCaja({
      id_sede: "",
      id_usuario: "",
      monto_inicial: "",
      observacion: "",
    });
    setModalCaja(true);
  };

  const abrirEditarCaja = (caja) => {
    if (caja.estado_caja === "cerrada") {
      alert("No se puede editar una caja cerrada.");
      return;
    }

    setModoEditar(true);
    setCajaSeleccionada(caja);
    setFormCaja({
      id_sede: caja.id_sede || "",
      id_usuario: caja.id_usuario || "",
      monto_inicial: caja.monto_inicial || "",
      observacion: caja.observacion || "",
    });
    setModalCaja(true);
  };

  const cerrarModalCaja = () => {
    setModalCaja(false);
    setModoEditar(false);
    setCajaSeleccionada(null);
  };

  const manejarCambioCaja = (e) => {
    const { name, value } = e.target;

    setFormCaja({
      ...formCaja,
      [name]: value,
    });
  };

  const guardarCaja = async (e) => {
    e.preventDefault();

    if (!formCaja.id_sede || !formCaja.id_usuario || !formCaja.monto_inicial) {
      alert("Completa sede, usuario responsable y monto inicial.");
      return;
    }

    try {
      setGuardando(true);

      if (modoEditar && cajaSeleccionada) {
        await api.put(`/cajas/${cajaSeleccionada.id_caja}`, formCaja);
        alert("Caja actualizada correctamente.");
      } else {
        await api.post("/cajas", formCaja);
        alert("Caja aperturada correctamente.");
      }

      cerrarModalCaja();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "No se pudo guardar la caja.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirCerrarCaja = (caja) => {
    if (caja.estado_caja !== "abierta") {
      alert("Solo se puede cerrar una caja abierta.");
      return;
    }

    setCajaSeleccionada(caja);
    setFormCierre({
      monto_final: "",
      observacion: "",
    });
    setModalCerrar(true);
  };

  const cerrarModalCierre = () => {
    setModalCerrar(false);
    setCajaSeleccionada(null);
    setFormCierre({
      monto_final: "",
      observacion: "",
    });
  };

  const manejarCambioCierre = (e) => {
    const { name, value } = e.target;

    setFormCierre({
      ...formCierre,
      [name]: value,
    });
  };

  const confirmarCierreCaja = async (e) => {
    e.preventDefault();

    if (!formCierre.monto_final) {
      alert("Ingresa el monto final.");
      return;
    }

    try {
      setGuardando(true);

      await api.put(`/cajas/${cajaSeleccionada.id_caja}/cerrar`, formCierre);

      alert("Caja cerrada correctamente.");
      cerrarModalCierre();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "No se pudo cerrar la caja.");
    } finally {
      setGuardando(false);
    }
  };

  const anularCaja = async (caja) => {
    if (caja.estado_caja === "cerrada") {
      alert("No se puede anular una caja cerrada.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas anular la caja #${caja.id_caja}?`
    );

    if (!confirmar) return;

    try {
      await api.delete(`/cajas/${caja.id_caja}`);
      alert("Caja anulada correctamente.");
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "No se pudo anular la caja.");
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

  const formatearMonto = (monto) => {
    const numero = Number(monto || 0);

    return numero.toLocaleString("es-PE", {
      style: "currency",
      currency: "PEN",
    });
  };

  const claseEstado = (estado) => {
    if (estado === "abierta") return "estado-caja estado-abierta";
    if (estado === "cerrada") return "estado-caja estado-cerrada";
    if (estado === "anulada") return "estado-caja estado-anulada";
    return "estado-caja";
  };

  return (
    <div className="cajas-page">
      <section className="cajas-header">
        <div>
          <p className="cajas-breadcrumb">ADMINISTRACIÓN / CAJAS</p>
          <h1>Cajas</h1>
          <p>
            Bienvenido, <strong>Admin</strong>. Aquí puedes controlar la
            apertura y cierre de cajas por sede.
          </p>
        </div>

        <button className="btn-caja-principal" onClick={cargarDatos}>
          ↻ Actualizar
        </button>
      </section>

      <section className="cajas-resumen">
        <div className="caja-card">
          <div className="caja-icono rosado">▣</div>
          <div>
            <span>Total cajas</span>
            <strong>{resumen.total_cajas || 0}</strong>
          </div>
        </div>

        <div className="caja-card">
          <div className="caja-icono verde">✓</div>
          <div>
            <span>Cajas abiertas</span>
            <strong>{resumen.cajas_abiertas || 0}</strong>
          </div>
        </div>

        <div className="caja-card">
          <div className="caja-icono morado">🔒</div>
          <div>
            <span>Cajas cerradas</span>
            <strong>{resumen.cajas_cerradas || 0}</strong>
          </div>
        </div>

        <div className="caja-card">
          <div className="caja-icono amarillo">S/</div>
          <div>
            <span>Monto actual</span>
            <strong>{formatearMonto(resumen.monto_total_actual)}</strong>
          </div>
        </div>
      </section>

      <section className="cajas-contenedor">
        <div className="cajas-tabla-header">
          <div>
            <h2>Cajas registradas</h2>
            <p>{cajasFiltradas.length} caja(s)</p>
          </div>

          <button className="btn-caja-principal" onClick={abrirNuevaCaja}>
            + Nueva caja
          </button>
        </div>

        <div className="cajas-buscador">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Buscar por sede, usuario, estado o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="cajas-tabla-scroll">
          <table className="cajas-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sede</th>
                <th>Usuario</th>
                <th>Apertura</th>
                <th>Cierre</th>
                <th>Inicial</th>
                <th>Ventas</th>
                <th>Final</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="10" className="tabla-vacia">
                    Cargando cajas...
                  </td>
                </tr>
              ) : cajasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="10" className="tabla-vacia">
                    No hay cajas registradas.
                  </td>
                </tr>
              ) : (
                cajasFiltradas.map((caja) => (
                  <tr key={caja.id_caja}>
                    <td>#{caja.id_caja}</td>

                    <td>
                      <span className="caja-celda-dato">
                        ⌂ {caja.sede?.nombre || "Sin sede"}
                      </span>
                    </td>

                    <td>
                      <span className="caja-celda-dato">
                        👤{" "}
                        {caja.usuario
                          ? `${caja.usuario.nombres} ${caja.usuario.apellidos}`
                          : "Sin usuario"}
                      </span>
                    </td>

                    <td>{formatearFecha(caja.fecha_apertura)}</td>
                    <td>{formatearFecha(caja.fecha_cierre)}</td>
                    <td>{formatearMonto(caja.monto_inicial)}</td>
                    <td>{formatearMonto(caja.total_ventas)}</td>
                    <td>
                      {caja.monto_final
                        ? formatearMonto(caja.monto_final)
                        : "—"}
                    </td>

                    <td>
                      <span className={claseEstado(caja.estado_caja)}>
                        {caja.estado_caja || "Sin estado"}
                      </span>
                    </td>

                    <td>
                      <div className="cajas-acciones">
                        <button
                          className="btn-caja-accion editar"
                          onClick={() => abrirEditarCaja(caja)}
                        >
                          ✎ Editar
                        </button>

                        {caja.estado_caja === "abierta" && (
                          <button
                            className="btn-caja-accion cerrar"
                            onClick={() => abrirCerrarCaja(caja)}
                          >
                            🔒 Cerrar
                          </button>
                        )}

                        {caja.estado_caja !== "cerrada" && (
                          <button
                            className="btn-caja-accion anular"
                            onClick={() => anularCaja(caja)}
                          >
                            🗑 Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalCaja && (
        <div className="caja-modal-fondo">
          <div className="caja-modal">
            <div className="caja-modal-header">
              <div>
                <h2>{modoEditar ? "Editar caja" : "Nueva caja"}</h2>
                <p>
                  {modoEditar
                    ? "Actualiza los datos principales de la caja."
                    : "Registra la apertura de una nueva caja."}
                </p>
              </div>

              <button className="btn-caja-cerrar" onClick={cerrarModalCaja}>
                ×
              </button>
            </div>

            <form onSubmit={guardarCaja} className="caja-formulario">
              <div className="caja-form-grid">
                <label>
                  Sede
                  <select
                    name="id_sede"
                    value={formCaja.id_sede}
                    onChange={manejarCambioCaja}
                    required
                  >
                    <option value="">Seleccionar sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id_sede} value={sede.id_sede}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Usuario responsable
                  <select
                    name="id_usuario"
                    value={formCaja.id_usuario}
                    onChange={manejarCambioCaja}
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
                  Monto inicial
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="monto_inicial"
                    value={formCaja.monto_inicial}
                    onChange={manejarCambioCaja}
                    placeholder="Ejemplo: 100.00"
                    required
                  />
                </label>

                <label className="campo-completo">
                  Observación
                  <textarea
                    name="observacion"
                    value={formCaja.observacion}
                    onChange={manejarCambioCaja}
                    placeholder="Comentario opcional..."
                    rows="3"
                  />
                </label>
              </div>

              <div className="caja-modal-acciones">
                <button
                  type="button"
                  className="btn-caja-secundario"
                  onClick={cerrarModalCaja}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-caja-principal"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalCerrar && (
        <div className="caja-modal-fondo">
          <div className="caja-modal caja-modal-pequeno">
            <div className="caja-modal-header">
              <div>
                <h2>Cerrar caja</h2>
                <p>
                  Ingresa el monto final para cerrar la caja #
                  {cajaSeleccionada?.id_caja}.
                </p>
              </div>

              <button className="btn-caja-cerrar" onClick={cerrarModalCierre}>
                ×
              </button>
            </div>

            <form onSubmit={confirmarCierreCaja} className="caja-formulario">
              <label>
                Monto final
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="monto_final"
                  value={formCierre.monto_final}
                  onChange={manejarCambioCierre}
                  placeholder="Ejemplo: 250.00"
                  required
                />
              </label>

              <label>
                Observación
                <textarea
                  name="observacion"
                  value={formCierre.observacion}
                  onChange={manejarCambioCierre}
                  placeholder="Comentario opcional..."
                  rows="3"
                />
              </label>

              <div className="caja-modal-acciones">
                <button
                  type="button"
                  className="btn-caja-secundario"
                  onClick={cerrarModalCierre}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-caja-principal"
                  disabled={guardando}
                >
                  {guardando ? "Cerrando..." : "Cerrar caja"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}