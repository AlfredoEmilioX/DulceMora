import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";

import DashboardLayout from "./layouts/DashboardLayout";

import Reportes from "./pages/dashboard/Reportes";
import Ventas from "./pages/dashboard/Ventas";
import HistorialVentas from "./pages/dashboard/HistorialVentas";
import Comprobantes from "./pages/dashboard/Comprobantes";
import Clientes from "./pages/dashboard/Clientes";
import Productos from "./pages/dashboard/Productos";
import Categorias from "./pages/dashboard/Categorias";
import Promociones from "./pages/dashboard/Promociones";
import Inventario from "./pages/dashboard/Inventario";
import Compras from "./pages/dashboard/Compras";
import Proveedores from "./pages/dashboard/Proveedores";
import Pedidos from "./pages/dashboard/Pedidos";
import Reservas from "./pages/dashboard/Reservas";
import Caja from "./pages/dashboard/Cajas";
import Cumpleanos from "./pages/dashboard/Cumpleanos";
import Notificaciones from "./pages/dashboard/Notificaciones";

import Usuarios from "./pages/admin/Usuarios";
import Sedes from "./pages/admin/Sedes";
import Configuracion from "./pages/admin/Configuracion";

import Carrito from "./pages/public/Carrito";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function MiCuenta() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1>Mi cuenta</h1>

        <p>
          Bienvenido, <strong>{usuario?.nombres}</strong>. Aquí verá sus datos
          el cliente.
        </p>

        <div className="admin-actions">
          <Link to="/">Volver al inicio</Link>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* WEB PÚBLICA */}
        <Route path="/" element={<Home />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/carrito" element={<Carrito />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* PANEL INTERNO */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          
          <Route index element={<Navigate to="/admin/reportes" replace />} />
          
          <Route path="reportes" element={<Reportes />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="historial-ventas" element={<HistorialVentas />} />
          <Route path="comprobantes" element={<Comprobantes />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="productos" element={<Productos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="promociones" element={<Promociones />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="compras" element={<Compras />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="cajas" element={<Caja />} />
          <Route path="cumpleanos" element={<Cumpleanos />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          {/* SOLO ADMINISTRADOR */}
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="sedes" element={<Sedes />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* MI CUENTA */}
        <Route
          path="/mi-cuenta"
          element={
            <ProtectedRoute>
              <MiCuenta />
            </ProtectedRoute>
          }
        />

        {/* RUTA NO ENCONTRADA */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;