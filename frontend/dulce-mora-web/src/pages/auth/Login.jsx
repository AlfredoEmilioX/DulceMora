import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@dulcemora.com");
  const [password, setPassword] = useState("12345678");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      const { token, usuario } = response.data;

      if (!token || !usuario) {
        setMensaje("Respuesta inválida del servidor");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      setMensaje("Login correcto");

      console.log("Token:", token);
      console.log("Usuario:", usuario);

      setTimeout(() => {
        if (usuario.id_rol === 1) {
          navigate("/admin/reportes");
        } else if (usuario.id_rol === 2) {
          navigate("/admin/ventas");
        } else if (usuario.id_rol === 3) {
          navigate("/mi-cuenta");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error) {
      console.error(error);

      if (error.response) {
        setMensaje(error.response.data.message || "Error al iniciar sesión");
      } else {
        setMensaje("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Dulce Mora</h1>
        <p>Panel de administración</p>

        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="admin@dulcemora.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <Link to="/" className="volver-web">
          Volver a la web
        </Link>

        {mensaje && <div className="mensaje">{mensaje}</div>}
      </form>
    </div>
  );
}

export default Login;