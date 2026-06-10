import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/admin/configuracion.css";

export default function Configuracion() {
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre_negocio: "",
    logo: "",
    color_primario: "#d94f92",
    color_secundario: "#351b42",
    telefono: "",
    whatsapp: "",
    email: "",
    direccion: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    estado: true,
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setCargando(true);

      const respuesta = await api.get("/configuracion/principal");

      const data = respuesta.data?.data === null ? null : respuesta.data;

      if (data) {
        setFormulario({
          nombre_negocio: data.nombre_negocio || "",
          logo: data.logo || "",
          color_primario: data.color_primario || "#d94f92",
          color_secundario: data.color_secundario || "#351b42",
          telefono: data.telefono || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          direccion: data.direccion || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          tiktok: data.tiktok || "",
          estado: Boolean(data.estado),
        });
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la configuración.");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const guardarConfiguracion = async (e) => {
    e.preventDefault();

    if (!formulario.nombre_negocio.trim()) {
      alert("El nombre del negocio es obligatorio.");
      return;
    }

    try {
      setGuardando(true);

      await api.put("/configuracion/principal", formulario);

      alert("Configuración guardada correctamente.");
      cargarConfiguracion();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "No se pudo guardar la configuración."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="config-page">
      <section className="config-header">
        <div>
          <p className="config-breadcrumb">ADMINISTRACIÓN / CONFIGURACIÓN</p>
          <h1>Configuración</h1>
          <p>
            Administra los datos generales del negocio, información de contacto,
            redes sociales y colores principales del sistema.
          </p>
        </div>

        <button className="btn-config-principal" onClick={cargarConfiguracion}>
          ↻ Actualizar
        </button>
      </section>

      <section className="config-resumen">
        <div className="config-card">
          <div className="config-icono rosado">🏪</div>
          <div>
            <span>Negocio</span>
            <strong>{formulario.nombre_negocio || "Sin nombre"}</strong>
          </div>
        </div>

        <div className="config-card">
          <div className="config-icono verde">☎</div>
          <div>
            <span>Teléfono</span>
            <strong>{formulario.telefono || "No registrado"}</strong>
          </div>
        </div>

        <div className="config-card">
          <div className="config-icono morado">✉</div>
          <div>
            <span>Correo</span>
            <strong>{formulario.email || "No registrado"}</strong>
          </div>
        </div>

        <div className="config-card">
          <div className="config-icono amarillo">●</div>
          <div>
            <span>Estado</span>
            <strong>{formulario.estado ? "Activo" : "Inactivo"}</strong>
          </div>
        </div>
      </section>

      <section className="config-contenedor">
        <div className="config-titulo">
          <div>
            <h2>Datos generales</h2>
            <p>
              Estos datos pueden usarse en la web pública, comprobantes,
              contacto y personalización visual.
            </p>
          </div>
        </div>

        {cargando ? (
          <div className="config-cargando">Cargando configuración...</div>
        ) : (
          <form className="config-formulario" onSubmit={guardarConfiguracion}>
            <div className="config-form-grid">
              <label>
                Nombre del negocio
                <input
                  type="text"
                  name="nombre_negocio"
                  value={formulario.nombre_negocio}
                  onChange={manejarCambio}
                  placeholder="Ejemplo: Dulce Mora"
                  required
                />
              </label>

              <label>
                Logo / URL de imagen
                <input
                  type="text"
                  name="logo"
                  value={formulario.logo}
                  onChange={manejarCambio}
                  placeholder="Ejemplo: https://..."
                />
              </label>

              <label>
                Teléfono
                <input
                  type="text"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  placeholder="Ejemplo: 064 000000"
                />
              </label>

              <label>
                WhatsApp
                <input
                  type="text"
                  name="whatsapp"
                  value={formulario.whatsapp}
                  onChange={manejarCambio}
                  placeholder="Ejemplo: 999999999"
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  value={formulario.email}
                  onChange={manejarCambio}
                  placeholder="Ejemplo: contacto@dulcemora.com"
                />
              </label>

              <label>
                Dirección
                <input
                  type="text"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={manejarCambio}
                  placeholder="Ejemplo: Huancayo, Junín"
                />
              </label>

              <label>
                Color primario
                <div className="config-color-input">
                  <input
                    type="color"
                    name="color_primario"
                    value={formulario.color_primario || "#d94f92"}
                    onChange={manejarCambio}
                  />
                  <input
                    type="text"
                    name="color_primario"
                    value={formulario.color_primario}
                    onChange={manejarCambio}
                    placeholder="#d94f92"
                  />
                </div>
              </label>

              <label>
                Color secundario
                <div className="config-color-input">
                  <input
                    type="color"
                    name="color_secundario"
                    value={formulario.color_secundario || "#351b42"}
                    onChange={manejarCambio}
                  />
                  <input
                    type="text"
                    name="color_secundario"
                    value={formulario.color_secundario}
                    onChange={manejarCambio}
                    placeholder="#351b42"
                  />
                </div>
              </label>

              <label>
                Facebook
                <input
                  type="text"
                  name="facebook"
                  value={formulario.facebook}
                  onChange={manejarCambio}
                  placeholder="Enlace de Facebook"
                />
              </label>

              <label>
                Instagram
                <input
                  type="text"
                  name="instagram"
                  value={formulario.instagram}
                  onChange={manejarCambio}
                  placeholder="Enlace de Instagram"
                />
              </label>

              <label>
                TikTok
                <input
                  type="text"
                  name="tiktok"
                  value={formulario.tiktok}
                  onChange={manejarCambio}
                  placeholder="Enlace de TikTok"
                />
              </label>

              <label className="config-estado">
                Estado de configuración
                <div className="config-check">
                  <input
                    type="checkbox"
                    name="estado"
                    checked={formulario.estado}
                    onChange={manejarCambio}
                  />
                  <span>{formulario.estado ? "Activo" : "Inactivo"}</span>
                </div>
              </label>
            </div>

            {formulario.logo && (
              <div className="config-preview">
                <h3>Vista previa del logo</h3>
                <div className="config-logo-preview">
                  <img
                    src={formulario.logo}
                    alt="Logo del negocio"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="config-acciones">
              <button
                type="button"
                className="btn-config-secundario"
                onClick={cargarConfiguracion}
              >
                Cancelar cambios
              </button>

              <button
                type="submit"
                className="btn-config-principal"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar configuración"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}