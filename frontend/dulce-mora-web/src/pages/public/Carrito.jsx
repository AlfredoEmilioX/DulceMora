import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import "../../styles/public/carrito.css";

const STORAGE_KEY = "dulce_mora_carrito";

function obtenerCarrito() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

function Carrito() {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    setCarrito(obtenerCarrito());
  }, []);

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    );

    setCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  };

  const eliminarProducto = (id) => {
    const nuevoCarrito = carrito.filter((item) => item.id !== id);
    setCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const total = useMemo(() => {
    return carrito.reduce((suma, item) => {
      return suma + Number(item.precio || 0) * Number(item.cantidad || 1);
    }, 0);
  }, [carrito]);

  const totalProductos = useMemo(() => {
    return carrito.reduce((suma, item) => suma + Number(item.cantidad || 1), 0);
  }, [carrito]);

  if (carrito.length === 0) {
    return (
      <div className="carrito-page">
        <header className="carrito-header">
          <Link to="/" className="carrito-logo">
            Dulce Mora
          </Link>

          <Link to="/catalogo" className="carrito-volver">
            Seguir comprando
          </Link>
        </header>

        <main className="carrito-empty">
          <div className="carrito-empty-card">
            <div className="carrito-empty-icon">
              <FiShoppingBag />
            </div>

            <h1>Tu carrito está vacío</h1>
            <p>Agrega tus postres, tortas o helados favoritos al carrito.</p>

            <Link to="/" className="carrito-btn-principal">
              Ver catálogo
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <header className="carrito-header">
        <Link to="/" className="carrito-logo">
          Dulce Mora
        </Link>

        <Link to="/" className="carrito-volver">
          Seguir comprando
        </Link>
      </header>

      <main className="carrito-contenedor">
        <section className="carrito-lista">
          <div className="carrito-titulo">
            <h1>Carrito de compras</h1>
            <p>{totalProductos} producto(s) agregado(s)</p>
          </div>

          {carrito.map((item) => (
            <article className="carrito-item" key={item.id}>
              <div className="carrito-img">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <span>{item.name}</span>
                )}
              </div>

              <div className="carrito-info">
                <h3>{item.name}</h3>
                <p>{item.category}</p>
                <strong>S/ {Number(item.precio).toFixed(2)}</strong>
              </div>

              <div className="carrito-cantidad">
                <button
                  type="button"
                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                >
                  <FiMinus />
                </button>

                <span>{item.cantidad}</span>

                <button
                  type="button"
                  onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                >
                  <FiPlus />
                </button>
              </div>

              <div className="carrito-subtotal">
                <span>Subtotal</span>
                <strong>
                  S/ {(Number(item.precio) * Number(item.cantidad)).toFixed(2)}
                </strong>
              </div>

              <button
                type="button"
                className="carrito-eliminar"
                onClick={() => eliminarProducto(item.id)}
              >
                <FiTrash2 />
              </button>
            </article>
          ))}
        </section>

        <aside className="carrito-resumen">
          <h2>Resumen del pedido</h2>

          <div className="carrito-resumen-linea">
            <span>Productos</span>
            <strong>{totalProductos}</strong>
          </div>

          <div className="carrito-resumen-linea total">
            <span>Total</span>
            <strong>S/ {total.toFixed(2)}</strong>
          </div>

          <button type="button" className="carrito-finalizar">
            Continuar pedido
          </button>

          <button type="button" className="carrito-vaciar" onClick={vaciarCarrito}>
            Vaciar carrito
          </button>
        </aside>
      </main>
    </div>
  );
}

export default Carrito;