import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("perfil", data.perfil);
      localStorage.setItem("usuario", data.usuario);
      navigate("/books");
    } else {
      setErrorMessage("No se puede iniciar sessión");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="Login-space">
      <div className="Login-logo">
        <span>BIBLIOTECA.KOM</span>
      </div>
      <div className="Login-container">
        <form onSubmit={handleLogin} className="Login-form">
          <h2 className="Login-pestana">Inicia Sesión</h2>
          {errorMessage && (
            <p className="Login-error-message">{errorMessage}</p>
          )}
          <div className="Login-input-group">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="Login-input"
            />
          </div>
          <div className="Login-input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="Login-input"
            />
          </div>
          <div className="Login-button-group">
            <button type="submit" className="Login-button-submit">
              Ingresar
            </button>
            <button
              type="button"
              className="Login-button-register"
              onClick={() => navigate("/registre")}
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;