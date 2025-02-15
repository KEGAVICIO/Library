import { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [usuarioAlt, setUsuarioAlt] = useState(""); // Para almacenar el usuario que lo modificó
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error si algo sale mal

  useEffect(() => {
    const loggedUser = localStorage.getItem("username");
    if (loggedUser) {
      setUsuarioAlt(loggedUser.toUpperCase()); // Establecer el usuario que está realizando la acción
    }

    // Llamar al backend para obtener usuarios
    fetch("http://127.0.0.1:8000/api/users/")
      .then((response) => response.json())
      .then((data) => setUsers(data)) // Guardar usuarios en el estado
      .catch((error) => console.error("Error al obtener usuarios:", error));
  }, []);

  // Función para manejar el clic en una tarjeta y llenar los datos en el formulario
  const handleCardClick = (user) => {
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.perfil);
    setPassword(""); // Puedes mantener la contraseña vacía o usar otro valor predeterminado
  };

  // Función para manejar el registro (creación) de un nuevo usuario
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !role) {
      setErrorMessage("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", { // Usamos el mismo endpoint para el registro
        method: "POST", // Usamos POST para crear un nuevo usuario
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          perfil: role,
          usuarioAlt, // El usuario que realiza la acción
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setErrorMessage("Usuario creado correctamente");
        setUsername(""); // Limpiar el formulario después de crear el usuario
        setEmail("");
        setPassword("");
        setRole("");

        // Recargar la lista de usuarios después de registrar uno nuevo
        fetch("http://127.0.0.1:8000/api/users/")
          .then((response) => response.json())
          .then((data) => setUsers(data)) // Actualizar los usuarios
          .catch((error) => console.error("Error al obtener usuarios:", error));
      } else {
        setErrorMessage(data.message || "Error al crear usuario");
      }
    } catch (error) {
      setErrorMessage("Error al crear usuario");
    }
  };

  return (
    <div className="space">
      <div className="columns">
        <div className="left-column">
          {users.map((user, index) => (
            <div className="card" key={index} onClick={() => handleCardClick(user)}>
              <p className="dcard">
                <span className="material-icons">account_circle</span>{" "}
                <strong>{user.username}</strong>
              </p>
              <p className="dcard">
                <span className="material-icons">email</span> {user.email}
              </p>
              <p className="dcard">
                <span className="material-icons">privacy_tip</span> {user.perfil}
              </p>
            </div>
          ))}
        </div>

        <div className="right-column">
          <div className="dats">
            <h2>Datos del usuario</h2>
          </div>

          <form onSubmit={handleRegister}>
            {/* Mensaje de error si existe */}
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
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
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
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="button-group">
              <button type="submit">Registrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
