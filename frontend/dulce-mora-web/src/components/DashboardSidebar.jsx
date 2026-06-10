import { Link, useLocation } from "react-router-dom";
import {
  FiBarChart2,
  FiDollarSign,
  FiFileText,
  FiShoppingBag,
  FiGrid,
  FiUsers,
  FiBox,
  FiTruck,
  FiShoppingCart,
  FiPackage,
  FiCalendar,
  FiUserCheck,
  FiMapPin,
  FiCreditCard,
  FiSettings,
  FiGift,
  FiBell,
  FiHome,
  FiLogOut,
  FiClock,
} from "react-icons/fi";

function DashboardSidebar() {
  const location = useLocation();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
      ? "active"
      : "";
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand">
        <img src="/img/logo-dulce-mora.png" alt="Dulce Mora" />

        <div>
          <h2>Dulce Mora</h2>
          <span>Panel administrativo</span>
        </div>
      </div>

      <nav className="dashboard-menu admin-menu-scroll">
        <div className="menu-group">
          <span className="menu-title">General</span>

          <Link className={isActive("/admin/reportes")} to="/admin/reportes">
            <FiBarChart2 />
            Reportes
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-title">Ventas</span>

          <Link className={isActive("/admin/ventas")} to="/admin/ventas">
            <FiDollarSign />
            Ventas
          </Link>

          <Link
            className={isActive("/admin/historial-ventas")}
            to="/admin/historial-ventas"
          >
            <FiClock />
            Historial de ventas
          </Link>

          <Link
            className={isActive("/admin/comprobantes")}
            to="/admin/comprobantes"
          >
            <FiFileText />
            Comprobantes
          </Link>

          <Link className={isActive("/admin/clientes")} to="/admin/clientes">
            <FiUsers />
            Clientes
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-title">Catálogo</span>

          <Link className={isActive("/admin/productos")} to="/admin/productos">
            <FiShoppingBag />
            Productos
          </Link>

          <Link
            className={isActive("/admin/categorias")}
            to="/admin/categorias"
          >
            <FiGrid />
            Categorías
          </Link>

          <Link
            className={isActive("/admin/promociones")}
            to="/admin/promociones"
          >
            <FiGift />
            Promociones
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-title">Operaciones</span>

          <Link
            className={isActive("/admin/inventario")}
            to="/admin/inventario"
          >
            <FiBox />
            Inventario
          </Link>

          <Link className={isActive("/admin/compras")} to="/admin/compras">
            <FiShoppingCart />
            Compras
          </Link>

          <Link
            className={isActive("/admin/proveedores")}
            to="/admin/proveedores"
          >
            <FiPackage />
            Proveedores
          </Link>

          <Link className={isActive("/admin/pedidos")} to="/admin/pedidos">
            <FiTruck />
            Pedidos
          </Link>

          <Link className={isActive("/admin/reservas")} to="/admin/reservas">
            <FiCalendar />
            Reservas
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-title">Administración</span>

          <Link className={isActive("/admin/usuarios")} to="/admin/usuarios">
            <FiUserCheck />
            Usuarios
          </Link>

          <Link className={isActive("/admin/sedes")} to="/admin/sedes">
            <FiMapPin />
            Sedes
          </Link>

          <Link className={isActive("/admin/cajas")} to="/admin/cajas">
            <FiCreditCard />
            Cajas
          </Link>

          <Link
            className={isActive("/admin/configuracion")}
            to="/admin/configuracion"
          >
            <FiSettings />
            Configuración
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-title">Fidelización</span>

          <Link
            className={isActive("/admin/cumpleanos")}
            to="/admin/cumpleanos"
          >
            <FiGift />
            Cumpleaños
          </Link>

          <Link
            className={isActive("/admin/notificaciones")}
            to="/admin/notificaciones"
          >
            <FiBell />
            Notificaciones
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-title">Web</span>

          <Link to="/">
            <FiHome />
            Ver web
          </Link>
        </div>
      </nav>

      <button type="button" className="logout-button" onClick={cerrarSesion}>
        <FiLogOut />
        Cerrar sesión
      </button>
    </aside>
  );
}

export default DashboardSidebar;