import { Link, useNavigate } from "react-router-dom";

import {
  FiMapPin,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiGift,
  FiMessageCircle,
  FiClock,
  FiNavigation,
  FiSend,
} from "react-icons/fi";

import {
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
} from "react-icons/fa";

const featuredProducts = [
  {
    id: 1,
    name: "Cheesecake de Maracuyá",
    category: "Postre personal",
    price: "S/ 11.00",
    precio: 11,
    image: "/img/cheesecake-maracuya.png",
    badge: "Nuevo",
  },
  {
    id: 2,
    name: "Alfajor de Maracuyá",
    category: "Alfajor artesanal",
    price: "S/ 6.00",
    precio: 6,
    image: "/img/alfajor-maracuya.jpg",
    badge: "",
  },
  {
    id: 3,
    name: "Alfajor de Mango",
    category: "Alfajor artesanal",
    price: "S/ 6.00",
    precio: 6,
    image: "",
    badge: "",
  },
  {
    id: 4,
    name: "Donut Glaseada Rosada",
    category: "Donut artesanal",
    price: "S/ 5.00",
    precio: 5,
    image: "",
    badge: "",
  },
];

const branches = [
  {
    id: 1,
    name: "Huancayo",
    address: "Jr. Nacional 608, Huancayo 12004",
    hours: "Lun - Dom: 9:00 a.m. - 9:00 p.m.",
    image: "/img/tienda-exterior.jpeg",
  },
  {
    id: 2,
    name: "El Tambo",
    address: "Av. Mariátegui 1234, El Tambo",
    hours: "Lun - Dom: 9:00 a.m. - 9:00 p.m.",
    image: "/img/tienda-interior.jpeg",
  },
];

function Home() {
  const navigate = useNavigate();

  const agregarAlCarrito = (product) => {
    const carritoActual = JSON.parse(
      localStorage.getItem("dulce_mora_carrito") || "[]"
    );

    const productoExiste = carritoActual.find((item) => item.id === product.id);

    let nuevoCarrito;

    if (productoExiste) {
      nuevoCarrito = carritoActual.map((item) =>
        item.id === product.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      );
    } else {
      nuevoCarrito = [
        ...carritoActual,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          precio: product.precio,
          price: product.price,
          image: product.image,
          cantidad: 1,
        },
      ];
    }

    localStorage.setItem("dulce_mora_carrito", JSON.stringify(nuevoCarrito));

    navigate("/carrito");
  };

  return (
    <div className="site">
      {/* TOP BAR */}
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span className="top-strip-item">
            <FiMapPin /> Huancayo, Perú
          </span>

          <span className="top-strip-item">
            <FaWhatsapp /> Pedidos personalizados por WhatsApp
          </span>
        </div>
      </div>

      {/* HEADER */}
      <header className="main-header">
        <div className="container header-inner">
          <a href="#inicio" className="brand">
            <div className="brand-logo-box">
              <img
                src="/img/logo-dulce-mora.png"
                alt="Dulce Mora"
                className="brand-logo"
              />

              <div className="brand-text">
                <strong>Dulce Mora</strong>
                <span>Pastelería artesanal</span>
              </div>
            </div>
          </a>

          <nav className="main-nav">
            <a href="#inicio" className="active">
              Inicio
            </a>
            <a href="#catalogo">Catálogo</a>
            <a href="#promociones">Promociones</a>
            <a href="#sucursales">Sucursales</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div className="header-actions">
            <button className="icon-btn" aria-label="Buscar">
              <FiSearch />
            </button>

            <Link to="/carrito" className="icon-btn" aria-label="Carrito">
              <FiShoppingBag />
            </Link>

            <Link to="/login" className="login-btn">
              <FiUser />
              <span>Iniciar sesión</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section" id="inicio">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Pastelería artesanal</span>

            <h1 className="hero-title">
              Endulzamos
              <br />
              tus momentos
              <br />
              <span>especiales</span>
            </h1>

            <p className="hero-text">
              Tortas, postres y helados artesanales hechos con ingredientes de
              calidad y mucho amor para compartir, celebrar y regalar.
            </p>

            <div className="hero-buttons">
              <a href="#catalogo" className="btn btn-primary">
                <FiShoppingBag />
                Ver catálogo
              </a>

              <a href="#contacto" className="btn btn-secondary">
                <FaWhatsapp />
                Pedir por WhatsApp
              </a>
            </div>

            <div className="hero-dots">
              <span className="active"></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-shell">
              <img src="/img/tienda-exterior.jpeg" alt="Tienda Dulce Mora" />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="benefits-section">
        <div className="container benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <FiGift />
            </div>

            <div>
              <h4>10% de descuento</h4>
              <p>en tu primera compra</p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <FiShoppingBag />
            </div>

            <div>
              <h4>Pedidos personalizados</h4>
              <p>para momentos especiales</p>
            </div>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <FiMessageCircle />
            </div>

            <div>
              <h4>Pedidos por WhatsApp</h4>
              <p>atención rápida y directa</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS + PROMOCIONES */}
      <section className="catalog-section" id="catalogo">
        <div className="container catalog-layout">
          <div className="products-block">
            <div className="section-head">
              <h2>Productos destacados</h2>

              <a href="#catalogo" className="section-link">
                Ver catálogo completo →
              </a>
            </div>

            <div className="products-grid">
              {featuredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div
                    className={
                      product.image
                        ? "product-thumb product-thumb-img"
                        : "product-thumb placeholder"
                    }
                  >
                    {product.badge && (
                      <span className="product-badge">{product.badge}</span>
                    )}

                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>{product.name}</span>
                    )}
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.category}</p>
                    <strong>{product.price}</strong>

                    <button
                      type="button"
                      className="product-cart-btn"
                      onClick={() => agregarAlCarrito(product)}
                    >
                      <FiShoppingBag />
                      Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="promo-column" id="promociones">
            <div className="promo-card promo-cake">
              <div className="promo-copy">
                <h3>Encarga tu torta para ese día especial</h3>
                <p>Personalizadas a tu gusto.</p>

                <a href="#contacto" className="mini-btn">
                  Encargar ahora
                </a>
              </div>

              <div className="promo-visual">
                <div className="promo-placeholder cake-placeholder">
                  Banner torta
                </div>
              </div>
            </div>

            <div className="promo-card promo-icecream">
              <div className="promo-copy">
                <h3>Helados artesanales para todos los gustos</h3>
                <p>Sabores únicos, hechos cada día.</p>

                <a href="#catalogo" className="mini-btn alt">
                  Ver sabores
                </a>
              </div>

              <div className="promo-visual">
                <div className="promo-placeholder ice-placeholder">
                  Banner helados
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* SUCURSALES + NEWSLETTER */}
      <section className="branches-section" id="sucursales">
        <div className="container branches-layout">
          <div className="branches-block">
            <div className="section-head">
              <h2>Nuestras sucursales</h2>

              <a href="#sucursales" className="section-link">
                Ver todas las sucursales →
              </a>
            </div>

            <div className="branches-grid">
              {branches.map((branch) => (
                <article className="branch-card" key={branch.id}>
                  <img src={branch.image} alt={branch.name} />

                  <div className="branch-info">
                    <h3>{branch.name}</h3>

                    <p>
                      <FiMapPin /> {branch.address}
                    </p>

                    <p>
                      <FiClock /> {branch.hours}
                    </p>

                    <a href="#contacto">
                      <FiNavigation /> Cómo llegar
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="info-news-card">
            <div className="info-column">
              <h3>Dulce Mora</h3>

              <p>
                Pastelería artesanal y helados hechos con ingredientes
                seleccionados y mucho amor.
              </p>

              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <FaFacebookF />
                </a>

                <a href="#" aria-label="Instagram">
                  <FaInstagram />
                </a>

                <a href="#" aria-label="WhatsApp">
                  <FaWhatsapp />
                </a>
              </div>
            </div>

            <div className="news-column" id="contacto">
              <h3>Recibe dulces noticias</h3>
              <p>Promociones, nuevos productos y más directo en tu correo.</p>

              <form className="newsletter-form">
                <input type="email" placeholder="Tu correo electrónico" />

                <button type="button">
                  Suscribirme <FiSend />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© 2025 Dulce Mora. Todos los derechos reservados.</p>

          <div className="footer-links">
            <a href="#">Términos y condiciones</a>
            <a href="#">Política de privacidad</a>
            <a href="#">Libro de reclamaciones</a>
          </div>

          <div className="payment-methods">
            <span>Aceptamos:</span>

            <div className="payment-badges">
              <span className="pay-badge visa">
                <FaCcVisa />
              </span>

              <span className="pay-badge mc">
                <FaCcMastercard />
              </span>

              <span className="pay-badge yape">yape</span>
              <span className="pay-badge plin">plin</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;