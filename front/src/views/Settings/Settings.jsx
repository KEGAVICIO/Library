import { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [usuarioAlt, setUsuarioAlt] = useState(""); // Usuario que realiza la acción
  const [errorMessage, setErrorMessage] = useState(""); // Mensajes de error
  const [isEditing, setIsEditing] = useState(false); // Modo edición
  const [userState, setUserState] = useState(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem("usuario");
    if (loggedUser) {
      setUsuarioAlt(loggedUser.toUpperCase());
    }

    // Obtener usuarios
    fetch("http://127.0.0.1:8000/api/users/")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error al obtener usuarios:", error));
  }, []);

  // Manejar la selección de una tarjeta para editar usuario
  const handleCardClick = (user) => {
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.perfil);
    setPassword(""); // Limpiar campo de contraseña
    setUserState(Number(user.estado));
    setIsEditing(true);
  };

  const handleClear = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("");
    setIsEditing(false);
    setErrorMessage(""); // Opcional, si quieres limpiar los mensajes de error
  };

  const handleToggleUserState = async () => {
    
    if (!username || !email || !role) {
      setErrorMessage("Faltan datos del usuario.");
      return;
    }
  
    const newState = userState === 0 ? 1 : 0; // Alternar entre activo e inactivo
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${username}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username, // Mantener el nombre de usuario
          email,    // Enviar correo
          perfil: role, // Enviar rol
          estado: newState, // Estado nuevo
          usuarioAlt, // Usuario que realiza la acción
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setErrorMessage(newState === 0 ? "Usuario activado" : "Usuario desactivado");
        setUserState(newState); // Actualizar estado en la UI
  
        // Recargar usuarios
        fetch("http://127.0.0.1:8000/api/users/")
          .then((response) => response.json())
          .then((data) => setUsers(data))
          .catch((error) => console.error("Error al obtener usuarios:", error));
      } else {
        setErrorMessage(data.message || "Error al actualizar el estado del usuario.");
      }
    } catch (error) {
      setErrorMessage("Error al conectar con el servidor.");
    }
  };
  

  // Manejar el registro o actualización
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !role) {
      setErrorMessage("Usuario, correo y rol son obligatorios.");
      return;
    }

    if (!isEditing && !password) {
      setErrorMessage("La contraseña es obligatoria para el registro.");
      return;
    }

    try {
      const url = isEditing
        ? `http://127.0.0.1:8000/api/users/${username}/`
        : "http://127.0.0.1:8000/api/register/";

      const method = isEditing ? "PUT" : "POST";

      const requestBody = {
        username,
        email,
        perfil: role,
        usuarioAlt,
      };

      if (password) {
        requestBody.password = password; // Solo enviar si el usuario ingresó una nueva
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setErrorMessage(isEditing ? "Usuario actualizado correctamente" : "Registro exitoso");
        // Resetear formulario
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("");
        setIsEditing(false);

        // Recargar usuarios
        fetch("http://127.0.0.1:8000/api/users/")
          .then((response) => response.json())
          .then((data) => setUsers(data))
          .catch((error) => console.error("Error al obtener usuarios:", error));
      } else {
        setErrorMessage(data.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      setErrorMessage("Error al procesar la solicitud");
    }
  };

  return (
    <div className="space">
      <div className="columns">
        <div className="left-column">
          {users.map((user, index) => (
            <div 
            className={`card ${user.estado === "1" ? "inactive" : ""}`} 
            key={index} 
            onClick={() => handleCardClick(user)}>
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
            <h2>{isEditing ? "Actualizar usuario" : "Registrar usuario"}</h2>
          </div>

          <form onSubmit={handleSubmit}>
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
                placeholder= {isEditing ? "Cambiar Contraseña" : "Contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="">Selecciona un rol</option>
                <option value="visitante">Visitante</option>
                <option value="lector">Lector</option>
                <option value="editor">Editor</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="botones">
              <button type="submit" className="button">{isEditing ? "Actualizar" : "Registrar"}</button>
              <button type="button" className="button" onClick={handleToggleUserState} disabled={!isEditing}
              style={{ cursor: !isEditing ? "not-allowed" : "pointer", opacity: !isEditing ? 0.5 : 1 }}>
              {userState === 0 ? "Eliminar" : "Activar"}</button>
              <button type="button" className="button" onClick={handleClear}>Limpiar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
