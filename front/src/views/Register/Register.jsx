import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [usuarioAlt] = useState("SISTEMA"); // Valor por defecto
  const [errorMessage, setErrorMessage] = useState(""); // Estado del mensaje de error
  const navigate = useNavigate();

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
    <div className="Register-space">
      <div className="Register-logo">
          <span>BIBLIOTECA.KOM</span>
      </div>
      <div className="Register-container">
          <form onSubmit={handleRegister} className="Register-form">
              <h2 className="Register-tab">Regístrate</h2>
              {/* Muestra el mensaje de error si existe */}
              {errorMessage && <p className="Register-error-message">{errorMessage}</p>}
              <div className="Register-input-group">
                  <input
                      type="text"
                      placeholder="Usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toUpperCase())}
                      required
                  />
              </div>
              <div className="Register-input-group">
                  <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
              </div>
              <div className="Register-input-group">
                  <input
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  />
              </div>
              <div className="Register-input-group">
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="">Selecciona un rol</option>
                      <option value="visitante">Visitante</option>
                      <option value="lector">Lector</option>
                      <option value="editor">Editor</option>
                  </select>
              </div>
              <div className="Register-button-group">
                  <button type="submit" className="Register-new">Registrarse</button>
                  <button
                      type="button"
                      className="Register-back"
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
