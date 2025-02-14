import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [usuarioAlt, setUsuarioAlt] = useState("SISTEMA"); // Valor por defecto
  const [errorMessage, setErrorMessage] = useState(""); // Estado del mensaje de error
  const navigate = useNavigate();

  // Obtener el usuario que está autenticado si existe
  useEffect(() => {
    const loggedUser = localStorage.getItem("username"); // Suponiendo que el username está guardado en localStorage
    if (loggedUser) {
      setUsuarioAlt(loggedUser.toUpperCase());
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!username || !password || !email) {
      setErrorMessage("Todos los campos son obligatorios");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email,
          perfil: role || "visitante",
          usuarioAlt,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setErrorMessage("Registro exitoso");
        setErrorMessage(""); // Limpia el error si el registro es exitoso
        navigate("/");
      } else {
        setErrorMessage(data.message || "Error al registrarse"); // Muestra el mensaje de error del backend
      }
    } catch (error) {
      setErrorMessage("Error al registrarse");
    }
  };
  

  return (
    <div className="space">
      <div className="logo">
        <span>BIBLIOTECA.KOM</span>
      </div>

      <div className="register-container">
        <form onSubmit={handleRegister} className="register-form">
          <h2>Regístrate</h2>
          
          {/* Muestra el mensaje de error si existe */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Selecciona un rol</option>
              <option value="visitante">Visitante</option>
              <option value="lector">Lector</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div className="button-group">
            <button type="submit">Registrarse</button>
            <button
              type="button"
              className="volver"
              onClick={() => navigate("/")}
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
