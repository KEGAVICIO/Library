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
      //enviar a la searchbar
      localStorage.setItem("perfil", data.perfil);
      
      navigate("/books"); // Redirige si el login es exitoso
    } else {
      setErrorMessage("No se puede iniciar sessión"); // Muestra el mensaje de error
      setUsername(""); // Borra el campo usuario
      setPassword(""); // Borra el campo contraseña
    }
  };
  

  return (
    <div className="space">
        <div className="logo">
            <span>BIBLIOTECA.KOM</span>
        </div>

        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Inicia Sesión</h2>

                {/* Muestra el mensaje de error debajo de los botones si hay error */}
                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <div className="input-group">
                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toUpperCase())}
                />
                </div>

                <div className="input-group">
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>

                <div className="button-group">
                <button type="submit">Ingresar</button>
                <button type="button" 
                  className="Registrarse" 
                  onClick={() => navigate("/registre")}>
                    Registrarse </button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default Login;
