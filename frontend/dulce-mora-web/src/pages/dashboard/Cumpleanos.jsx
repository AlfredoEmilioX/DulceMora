import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "../../styles/dashboard/cumpleanos.css";

export default function Cumpleanos() {
  const fechaActual = new Date();

  const [clientes, setClientes] = useState([]);
  const [tipoReporte, setTipoReporte] = useState("mes");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [fechaDia, setFechaDia] = useState(obtenerFechaInput(fechaActual));
  const [fechaInicio, setFechaInicio] = useState(obtenerFechaInput(fechaActual));
  const [fechaFin, setFechaFin] = useState(obtenerFechaInput(fechaActual));
  const [fechaSemana, setFechaSemana] = useState(obtenerFechaInput(fechaActual));
  const [mesSeleccionado, setMesSeleccionado] = useState(
    String(fechaActual.getMonth() + 1)
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    String(fechaActual.getFullYear())
  );

  useEffect(() => {
    cargarClientes();
  }, []);

  function obtenerFechaInput(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  }

  const normalizarLista = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.clientes)) return data.clientes;
    return [];
  };

  const cargarClientes = async () => {
    try {
      setCargando(true);

      const respuesta = await api.get("/clientes");
      const lista = normalizarLista(respuesta.data);

      setClientes(lista);
    } catch (error) {
      console.error(error);
      alert(
        "No se pudieron cargar los clientes. Verifica que exista la ruta /clientes en tu backend."
      );
    } finally {
      setCargando(false);
    }
  };

  const obtenerPartesFecha = (fecha) => {
    if (!fecha) return null;

    const soloFecha = String(fecha).split("T")[0];
    const partes = soloFecha.split("-");

    if (partes.length !== 3) return null;

    return {
      anio: Number(partes[0]),
      mes: Number(partes[1]),
      dia: Number(partes[2]),
    };
  };

  const obtenerDiaAnio = (dia, mes, anio) => {
    const fecha = new Date(anio, mes - 1, dia);
    const inicio = new Date(anio, 0, 0);
    const diferencia = fecha - inicio;

    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  const obtenerRangoSemana = (fechaTexto) => {
    const fecha = new Date(`${fechaTexto}T00:00:00`);
    const diaSemana = fecha.getDay();
    const diferenciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

    const inicio = new Date(fecha);
    inicio.setDate(fecha.getDate() + diferenciaLunes);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    return { inicio, fin };
  };

  const clienteCumpleEnFiltro = (cliente) => {
    const nacimiento = obtenerPartesFecha(cliente.fecha_nacimiento);

    if (!nacimiento) return false;

    if (tipoReporte === "hoy") {
      const hoy = new Date();

      return (
        nacimiento.dia === hoy.getDate() &&
        nacimiento.mes === hoy.getMonth() + 1
      );
    }

    if (tipoReporte === "dia") {
      const fecha = obtenerPartesFecha(fechaDia);

      return (
        nacimiento.dia === fecha.dia &&
        nacimiento.mes === fecha.mes
      );
    }

    if (tipoReporte === "rango") {
      const inicio = obtenerPartesFecha(fechaInicio);
      const fin = obtenerPartesFecha(fechaFin);
      const anioBase = Number(anioSeleccionado);

      const cumpleDiaAnio = obtenerDiaAnio(
        nacimiento.dia,
        nacimiento.mes,
        anioBase
      );

      const inicioDiaAnio = obtenerDiaAnio(inicio.dia, inicio.mes, anioBase);
      const finDiaAnio = obtenerDiaAnio(fin.dia, fin.mes, anioBase);

      return cumpleDiaAnio >= inicioDiaAnio && cumpleDiaAnio <= finDiaAnio;
    }

    if (tipoReporte === "semana") {
      const { inicio, fin } = obtenerRangoSemana(fechaSemana);
      const anioBase = inicio.getFullYear();

      const cumple = new Date(
        anioBase,
        nacimiento.mes - 1,
        nacimiento.dia
      );

      return cumple >= inicio && cumple <= fin;
    }

    if (tipoReporte === "mes") {
      return nacimiento.mes === Number(mesSeleccionado);
    }

    return true;
  };

  const clientesReporte = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return clientes
      .filter(clienteCumpleEnFiltro)
      .filter((cliente) => {
        if (!texto) return true;

        const nombreCompleto = `${cliente.nombres || ""} ${
          cliente.apellidos || ""
        }`;

        const dni = cliente.dni || "";
        const telefono = cliente.telefono || "";
        const email = cliente.email || "";

        return (
          nombreCompleto.toLowerCase().includes(texto) ||
          dni.toLowerCase().includes(texto) ||
          telefono.toLowerCase().includes(texto) ||
          email.toLowerCase().includes(texto)
        );
      });
  }, [
    clientes,
    tipoReporte,
    busqueda,
    fechaDia,
    fechaInicio,
    fechaFin,
    fechaSemana,
    mesSeleccionado,
    anioSeleccionado,
  ]);

  const cumpleanosHoy = useMemo(() => {
    const hoy = new Date();

    return clientes.filter((cliente) => {
      const fecha = obtenerPartesFecha(cliente.fecha_nacimiento);

      if (!fecha) return false;

      return fecha.dia === hoy.getDate() && fecha.mes === hoy.getMonth() + 1;
    });
  }, [clientes]);

  const cumpleanosMes = useMemo(() => {
    const mesActual = new Date().getMonth() + 1;

    return clientes.filter((cliente) => {
      const fecha = obtenerPartesFecha(cliente.fecha_nacimiento);

      if (!fecha) return false;

      return fecha.mes === mesActual;
    });
  }, [clientes]);

  const clientesConTelefono = clientesReporte.filter(
    (cliente) => cliente.telefono
  ).length;

  const clientesSaludados = clientesReporte.filter((cliente) => {
    if (!cliente.fecha_ultimo_saludo_cumpleanos) return false;

    const fechaSaludo = new Date(cliente.fecha_ultimo_saludo_cumpleanos);
    const anioActual = new Date().getFullYear();

    return fechaSaludo.getFullYear() === anioActual;
  }).length;

  const calcularEdad = (fechaNacimiento) => {
    const nacimiento = obtenerPartesFecha(fechaNacimiento);

    if (!nacimiento) return null;

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.anio;

    const yaCumplio =
      hoy.getMonth() + 1 > nacimiento.mes ||
      (hoy.getMonth() + 1 === nacimiento.mes &&
        hoy.getDate() >= nacimiento.dia);

    if (!yaCumplio) edad--;

    return edad;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";

    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const obtenerDiaMes = (fecha) => {
    const partes = obtenerPartesFecha(fecha);

    if (!partes) return "—";

    const fechaFormateada = new Date(
      2026,
      partes.mes - 1,
      partes.dia
    );

    return fechaFormateada.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
    });
  };

  const limpiarTelefono = (telefono) => {
    return String(telefono || "").replace(/\D/g, "");
  };

  const abrirWhatsApp = (cliente) => {
    const telefono = limpiarTelefono(cliente.telefono);

    if (!telefono) {
      alert("Este cliente no tiene teléfono registrado.");
      return;
    }

    const nombre = cliente.nombres || "cliente";

    const mensaje = `Hola ${nombre}, Dulce Mora te desea un feliz cumpleaños 🎂🎉. Esperamos que tengas un día muy especial.`;

    const url = `https://wa.me/51${telefono}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");
  };

  const estadoCumpleanos = (cliente) => {
    const hoy = new Date();
    const fecha = obtenerPartesFecha(cliente.fecha_nacimiento);

    if (!fecha) return "Sin fecha";

    const esHoy =
      hoy.getDate() === fecha.dia && hoy.getMonth() + 1 === fecha.mes;

    if (esHoy) return "Hoy";

    if (fecha.mes === hoy.getMonth() + 1) return "Este mes";

    return "Filtrado";
  };

  const claseEstado = (cliente) => {
    const estado = estadoCumpleanos(cliente);

    if (estado === "Hoy") return "estado-cumple estado-hoy";
    if (estado === "Este mes") return "estado-cumple estado-mes";

    return "estado-cumple estado-filtrado";
  };

  const limpiarFiltros = () => {
    setTipoReporte("mes");
    setBusqueda("");
    setFechaDia(obtenerFechaInput(new Date()));
    setFechaInicio(obtenerFechaInput(new Date()));
    setFechaFin(obtenerFechaInput(new Date()));
    setFechaSemana(obtenerFechaInput(new Date()));
    setMesSeleccionado(String(new Date().getMonth() + 1));
    setAnioSeleccionado(String(new Date().getFullYear()));
  };

  const obtenerTituloReporte = () => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    if (tipoReporte === "hoy") return "Cumpleaños de hoy";
    if (tipoReporte === "dia") return `Cumpleaños del día ${formatearFecha(fechaDia)}`;
    if (tipoReporte === "rango") {
      return `Cumpleaños del ${formatearFecha(fechaInicio)} al ${formatearFecha(
        fechaFin
      )}`;
    }
    if (tipoReporte === "semana") {
      const { inicio, fin } = obtenerRangoSemana(fechaSemana);

      return `Cumpleaños de la semana del ${formatearFecha(
        obtenerFechaInput(inicio)
      )} al ${formatearFecha(obtenerFechaInput(fin))}`;
    }
    if (tipoReporte === "mes") {
      return `Cumpleaños de ${meses[Number(mesSeleccionado) - 1]} ${anioSeleccionado}`;
    }

    return "Reporte de cumpleaños";
  };

  const exportarExcel = () => {
    if (clientesReporte.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const filas = clientesReporte.map((cliente) => ({
      ID: cliente.id_cliente,
      Cliente: `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim(),
      DNI: cliente.dni || "",
      Telefono: cliente.telefono || "",
      Correo: cliente.email || "",
      Cumpleanos: obtenerDiaMes(cliente.fecha_nacimiento),
      Edad: calcularEdad(cliente.fecha_nacimiento) || "",
      UltimoSaludo: formatearFecha(cliente.fecha_ultimo_saludo_cumpleanos),
      Estado: estadoCumpleanos(cliente),
    }));

    const encabezados = Object.keys(filas[0]);

    const contenido = [
      encabezados.join(";"),
      ...filas.map((fila) =>
        encabezados
          .map((encabezado) => `"${String(fila[encabezado]).replace(/"/g, '""')}"`)
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const enlace = document.createElement("a");
    const url = URL.createObjectURL(blob);

    enlace.href = url;
    enlace.download = "reporte_cumpleanos_clientes.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  };

  const exportarPDF = () => {
    if (clientesReporte.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const filas = clientesReporte
      .map(
        (cliente) => `
          <tr>
            <td>#${cliente.id_cliente}</td>
            <td>${cliente.nombres || ""} ${cliente.apellidos || ""}</td>
            <td>${cliente.dni || "—"}</td>
            <td>${cliente.telefono || "—"}</td>
            <td>${cliente.email || "—"}</td>
            <td>${obtenerDiaMes(cliente.fecha_nacimiento)}</td>
            <td>${calcularEdad(cliente.fecha_nacimiento) || "—"} años</td>
            <td>${formatearFecha(cliente.fecha_ultimo_saludo_cumpleanos)}</td>
            <td>${estadoCumpleanos(cliente)}</td>
          </tr>
        `
      )
      .join("");

    const ventana = window.open("", "_blank");

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte de cumpleaños</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #351b42;
            }

            h1 {
              color: #d94f92;
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
              background: #d94f92;
              color: white;
              padding: 8px;
              text-align: left;
            }

            td {
              border: 1px solid #f0bfd6;
              padding: 8px;
            }
          </style>
        </head>
        <body>
          <h1>Dulce Mora</h1>
          <p>${obtenerTituloReporte()}</p>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Cumpleaños</th>
                <th>Edad</th>
                <th>Último saludo</th>
                <th>Estado</th>
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

  return (
    <div className="cumple-page">
      <section className="cumple-header">
        <div>
          <p className="cumple-breadcrumb">FIDELIZACIÓN / CUMPLEAÑOS</p>
          <h1>Cumpleaños</h1>
          <p>
            Consulta y genera reportes de los cumpleaños de clientes registrados
            por día, rango de días, semana o mes.
          </p>
        </div>

        <button className="btn-cumple-principal" onClick={cargarClientes}>
          ↻ Actualizar
        </button>
      </section>

      <section className="cumple-resumen">
        <div className="cumple-card">
          <div className="cumple-icono rosado">🎂</div>
          <div>
            <span>Cumpleaños hoy</span>
            <strong>{cumpleanosHoy.length}</strong>
          </div>
        </div>

        <div className="cumple-card">
          <div className="cumple-icono morado">📅</div>
          <div>
            <span>Cumpleaños del mes actual</span>
            <strong>{cumpleanosMes.length}</strong>
          </div>
        </div>

        <div className="cumple-card">
          <div className="cumple-icono verde">☎</div>
          <div>
            <span>Con teléfono</span>
            <strong>{clientesConTelefono}</strong>
          </div>
        </div>

        <div className="cumple-card">
          <div className="cumple-icono amarillo">✓</div>
          <div>
            <span>Saludados este año</span>
            <strong>{clientesSaludados}</strong>
          </div>
        </div>
      </section>

      <section className="cumple-contenedor">
        <div className="cumple-tabla-header">
          <div>
            <h2>Reporte de cumpleaños</h2>
            <p>{clientesReporte.length} cliente(s)</p>
          </div>

          <div className="cumple-acciones">
            <button className="btn-cumple-secundario" onClick={exportarExcel}>
              Exportar Excel
            </button>

            <button className="btn-cumple-secundario" onClick={exportarPDF}>
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="cumple-panel-filtros">
          <div className="cumple-campo">
            <label>Tipo de reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
            >
              <option value="hoy">Hoy</option>
              <option value="dia">Por día</option>
              <option value="rango">Rango de días</option>
              <option value="semana">Por semana</option>
              <option value="mes">Por mes</option>
            </select>
          </div>

          {tipoReporte === "dia" && (
            <div className="cumple-campo">
              <label>Seleccionar día</label>
              <input
                type="date"
                value={fechaDia}
                onChange={(e) => setFechaDia(e.target.value)}
              />
            </div>
          )}

          {tipoReporte === "rango" && (
            <>
              <div className="cumple-campo">
                <label>Desde</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>

              <div className="cumple-campo">
                <label>Hasta</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>

              <div className="cumple-campo">
                <label>Año de referencia</label>
                <input
                  type="number"
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(e.target.value)}
                />
              </div>
            </>
          )}

          {tipoReporte === "semana" && (
            <div className="cumple-campo">
              <label>Fecha dentro de la semana</label>
              <input
                type="date"
                value={fechaSemana}
                onChange={(e) => setFechaSemana(e.target.value)}
              />
            </div>
          )}

          {tipoReporte === "mes" && (
            <>
              <div className="cumple-campo">
                <label>Mes</label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(e.target.value)}
                >
                  <option value="1">Enero</option>
                  <option value="2">Febrero</option>
                  <option value="3">Marzo</option>
                  <option value="4">Abril</option>
                  <option value="5">Mayo</option>
                  <option value="6">Junio</option>
                  <option value="7">Julio</option>
                  <option value="8">Agosto</option>
                  <option value="9">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>

              <div className="cumple-campo">
                <label>Año de reporte</label>
                <input
                  type="number"
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(e.target.value)}
                />
              </div>
            </>
          )}

          <button className="btn-cumple-limpiar" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>

        <div className="cumple-buscador">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, teléfono o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <p className="cumple-titulo-reporte">{obtenerTituloReporte()}</p>

        <div className="cumple-tabla-scroll">
          <table className="cumple-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Cumpleaños</th>
                <th>Edad</th>
                <th>Último saludo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="10" className="tabla-vacia">
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientesReporte.length === 0 ? (
                <tr>
                  <td colSpan="10" className="tabla-vacia">
                    No hay clientes para mostrar con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                clientesReporte.map((cliente) => (
                  <tr key={cliente.id_cliente}>
                    <td>#{cliente.id_cliente}</td>

                    <td>
                      <span className="cumple-cliente">
                        👤 {cliente.nombres} {cliente.apellidos}
                      </span>
                    </td>

                    <td>{cliente.dni || "—"}</td>
                    <td>{cliente.telefono || "—"}</td>
                    <td>{cliente.email || "—"}</td>
                    <td>{obtenerDiaMes(cliente.fecha_nacimiento)}</td>
                    <td>
                      {calcularEdad(cliente.fecha_nacimiento)
                        ? `${calcularEdad(cliente.fecha_nacimiento)} años`
                        : "—"}
                    </td>
                    <td>
                      {formatearFecha(
                        cliente.fecha_ultimo_saludo_cumpleanos
                      )}
                    </td>

                    <td>
                      <span className={claseEstado(cliente)}>
                        {estadoCumpleanos(cliente)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-cumple-whatsapp"
                        onClick={() => abrirWhatsApp(cliente)}
                        disabled={!cliente.telefono}
                      >
                        WhatsApp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}