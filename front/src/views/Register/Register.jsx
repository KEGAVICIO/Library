import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Convertir el rol a los valores que espera la base de datos
    let perfil;
    if (role === "visitante") perfil = "4";
    else if (role === "lector") perfil = "3";
    else if (role === "editor") perfil = "2";
    else perfil = "4"; // Valor por defecto

    // Enviar los datos al backend
    const response = await fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        email,
        perfil, // Enviar el perfil en lugar del nombre del rol
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registro exitoso");
      navigate("/"); // Redirigir al login después del registro
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="space">
      <div className="logo">
        <span>BIBLIOTECA.KOM</span>
      </div>

      <div className="register-container">
        <form onSubmit={handleRegister} className="register-form">
          <h2>Registrate</h2>

          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
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
