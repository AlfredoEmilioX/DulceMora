import { useEffect, useState } from "react";
import api from "../api/axios";
import "../App.css";

function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const [productosRes, categoriasRes, configRes, sedesRes] =
        await Promise.all([
          api.get("/productos"),
          api.get("/categorias"),
          api.get("/configuraciones"),
          api.get("/sedes"),
        ]);

      setProductos(productosRes.data || []);
      setCategorias(categoriasRes.data || []);
      setConfiguracion(configRes.data?.[0] || null);
      setSedes(sedesRes.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const whatsapp = configuracion?.whatsapp || "999999999";

  return (
    <div className="home-page">
      <div className="top-bar">
        <span>📍 Huancayo, Perú</span>
        <span>💬 Pedidos personalizados por WhatsApp</span>
      </div>

      <header className="main-header">
        <div className="brand">
          <img
            className="brand-logo"
            src="/img/logo-dulce-mora.png"
            alt="Dulce Mora"
          />
          <div>
            <h1>Dulce Mora</h1>
            <p>Hecho con amor</p>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="#inicio" className="active">
            Inicio
          </a>
          <a href="#catalogo">Catálogo</a>
          <a href="#promociones">Promociones</a>
          <a href="#sucursales">Sucursales</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className="nav-actions">
          <button className="circle-button">🔍</button>
          <button className="circle-button">🛒</button>
          <button className="login-btn">Iniciar sesión</button>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="hero-text">
            <span className="hero-label">Pastelería artesanal</span>

            <h2>
              Endulzamos tus
              <br />
              momentos <strong>especiales</strong>
            </h2>

            <p>
              Tortas, postres, helados y detalles preparados con amor para
              compartir, celebrar y regalar.
            </p>

            <div className="hero-buttons">
              <a href="#catalogo" className="btn-primary">
                Ver catálogo
              </a>

              <a
                href={`https://wa.me/51${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                Pedir por WhatsApp
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img src="/img/tienda-exterior.jpeg" alt="Tienda Dulce Mora" />
          </div>
        </section>

        <section className="info-strip">
          <article>
            <span>🎁</span>
            <div>
              <h3>10% de descuento</h3>
              <p>en tu primera compra</p>
            </div>
          </article>

          <article>
            <span>🧁</span>
            <div>
              <h3>Pedidos personalizados</h3>
              <p>para momentos especiales</p>
            </div>
          </article>

          <article>
            <span>💬</span>
            <div>
              <h3>Pedidos por WhatsApp</h3>
              <p>atención rápida y directa</p>
            </div>
          </article>
        </section>

        <section className="categories-section">
          <div className="section-title">
            <span>Explora</span>
            <h2>Nuestras categorías</h2>
          </div>

          <div className="categories-row">
            {categorias.length > 0 ? (
              categorias.map((categoria) => (
                <article className="category-mini" key={categoria.id_categoria}>
                  <div className="category-emoji">🍰</div>
                  <h3>{categoria.nombre_categoria}</h3>
                  <p>Ver productos</p>
                </article>
              ))
            ) : (
              <>
                <article className="category-mini">
                  <div className="category-emoji">🎂</div>
                  <h3>Tortas</h3>
                  <p>Ver productos</p>
                </article>

                <article className="category-mini">
                  <div className="category-emoji">🍦</div>
                  <h3>Helados</h3>
                  <p>Ver productos</p>
                </article>

                <article className="category-mini">
                  <div className="category-emoji">🧁</div>
                  <h3>Postres</h3>
                  <p>Ver productos</p>
                </article>
              </>
            )}
          </div>
        </section>

        <section id="catalogo" className="products-section">
          <div className="section-head">
            <div>
              <span>Lo más pedido</span>
              <h2>Nuestros favoritos</h2>
            </div>

            <a href="#catalogo">Ver catálogo completo →</a>
          </div>

          {loading ? (
            <p className="loading-text">Cargando productos...</p>
          ) : (
            <div className="products-grid">
              {productos.slice(0, 5).map((producto) => (
                <article className="product-card" key={producto.id_producto}>
                  <button className="favorite-btn">♡</button>

                  <div className="product-photo">
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre_producto}
                      />
                    ) : (
                      <span>🍰</span>
                    )}
                  </div>

                  <div className="product-content">
                    <h3>{producto.nombre_producto}</h3>
                    <p>
                      {producto.descripcion || "Producto artesanal Dulce Mora"}
                    </p>

                    <div className="product-footer">
                      <strong>S/ {Number(producto.precio).toFixed(2)}</strong>
                      <button>+</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="promociones" className="promo-banner">
          <div>
            <span>Promoción especial</span>
            <h2>Encarga tu torta para ese día especial</h2>
            <p>Personalizadas a tu gusto y hechas con mucho amor.</p>
          </div>

          <a
            href={`https://wa.me/51${whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            Encargar ahora
          </a>
        </section>

        <section id="sucursales" className="branches-section">
          <div className="section-head">
            <div>
              <span>Visítanos</span>
              <h2>Nuestras sucursales</h2>
            </div>

            <a href="#sucursales">Ver todas →</a>
          </div>

          <div className="branches-layout">
            <div className="branches-list">
              {sedes.length > 0 ? (
                sedes.map((sede) => (
                  <article className="branch-card" key={sede.id_sede}>
                    <img
                      src="/img/tienda-interior.jpeg"
                      alt={sede.nombre_comercial}
                    />

                    <div>
                      <h3>{sede.nombre_comercial}</h3>
                      <p>📍 {sede.direccion}</p>
                      <p>📞 {sede.telefono}</p>

                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(
                          sede.direccion,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Cómo llegar
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <article className="branch-card">
                  <img
                    src="/img/tienda-interior.jpeg"
                    alt="Dulce Mora Huancayo"
                  />
                  <div>
                    <h3>Dulce Mora Huancayo</h3>
                    <p>📍 Huancayo, Perú</p>
                    <p>📞 999999999</p>
                    <a href="#contacto">Cómo llegar</a>
                  </div>
                </article>
              )}
            </div>

            <div className="map-card">
              <span>📍</span>
              <h3>Encuéntranos cerca de ti</h3>
              <p>Visítanos o coordina tu pedido por WhatsApp.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div>
            <span>Sobre la tienda</span>
            <h2>Detalles dulces, hechos con amor</h2>
            <p>
              En Dulce Mora elaboramos cada producto de forma artesanal, con
              ingredientes seleccionados y mucho cariño.
            </p>
          </div>

          <div className="about-image">
            <img src="/img/tienda-interior.jpeg" alt="Interior Dulce Mora" />
          </div>
        </section>
      </main>

      <footer id="contacto" className="footer">
        <div>
          <h2>Dulce Mora</h2>
          <p>Pastelería artesanal hecha con amor.</p>
        </div>

        <div>
          <p>WhatsApp: {configuracion?.whatsapp || "999999999"}</p>
          <p>Email: {configuracion?.email || "contacto@dulcemora.com"}</p>
          <p>Dirección: {configuracion?.direccion || "Huancayo"}</p>
        </div>
      </footer>

      <a
        className="whatsapp-float"
        href={`https://wa.me/51${whatsapp}`}
        target="_blank"
        rel="noreferrer"
      >
        💬
      </a>
    </div>
  );
}

export default Home;
