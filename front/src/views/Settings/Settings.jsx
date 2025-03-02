import { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Mensajes de error
  const [isEditing, setIsEditing] = useState(false); // Modo edición
  const [userState, setUserState] = useState(null);
  const [usuarioAlt, setUsuarioAlt] = useState(""); // Usuario que realiza la acción
  const [userId, setUserId] = useState(null); // Estado para almacenar el id del usuario


  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "success" o "error"

  const [filterUsername, setFilterUsername] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterUserState, setFilterUserState] = useState(null);



  useEffect(() => {  
    const loggedUser = localStorage.getItem("usuario");
    if (loggedUser) {
      setUsuarioAlt(loggedUser.toUpperCase());
    }
    fetchAllUsers(); // Llama a la función al cargar la página
  }, []);
  
  const fetchAllUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchFilteredUsers();
  }, [filterUsername, filterEmail, filterRole, filterUserState]);

  const fetchFilteredUsers = async () => {
    try {
      // Si no hay filtros, usar fetchAllUsers directamente
      if (!filterUsername && !filterEmail && !filterRole && !filterUserState) {
        await fetchAllUsers();
        return;
      }
  
      const queryParams = new URLSearchParams();
      
      // Solo agregar parámetros si tienen valor
      if (filterUsername) queryParams.append("username", filterUsername.toLowerCase());
      if (filterEmail) queryParams.append("email", filterEmail);
      if (filterRole) queryParams.append("perfil", filterRole);
      if (filterUserState) queryParams.append("estado", filterUserState);
  
      const response = await fetch(`http://127.0.0.1:8000/api/users/?${queryParams.toString()}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al filtrar usuarios:", error);
      setUsers([]); // Limpiar usuarios en caso de error
    }
  };
    
  
  // Manejar la selección de una tarjeta para editar usuario
  const handleCardClick = (user) => {
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.perfil);
    setPassword(""); // Limpiar campo de contraseña
    setUserState(Number(user.estado));
    setIsEditing(true);
    setUserId(user.id); // Añadir el ID
  };
  

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
  
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 1000);
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
      showAlert("Faltan datos del usuario.");
      return;
    }
  
    const newState = userState === 0 ? 1 : 0; // Alternar entre activo e inactivo
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
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
        showAlert(newState === 0 ? "Usuario activado" : "Usuario desactivado");
        setUserState(newState); // Actualizar estado en la UI
  
        // Recargar usuarios
        fetch("http://127.0.0.1:8000/api/users/")
          .then((response) => response.json())
          .then((data) => setUsers(data))
          .catch((error) => console.error("Error al obtener usuarios:", error));
      } else {
        showAlert(data.message || "Error al actualizar el estado del usuario.");
      }
    } catch (error) {
      showAlert("Error al conectar con el servidor.");
    }
  };
  

  // Manejar el registro o actualización
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !role) {
      showAlert("Usuario, correo y rol son obligatorios.");
      return;
    }

    if (!isEditing && !password) {
      showAlert("La contraseña es obligatoria para el registro.");
      return;
    }

    try {
      const url = isEditing
        ? `http://127.0.0.1:8000/api/users/${userId}/`
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
        showAlert(isEditing ? "Usuario actualizado" : "Registro exitoso");
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
        showAlert(data.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      showAlert("Error al procesar la solicitud");
    }
  };

  return (
    <div className="Setting-espacio">
      <div className="Settings-space">
        <div className="Settings-columns">
          <div className="Settings-left-column">
            <div className="Settings-filters">
              <input
                type="text"
                placeholder="Usuario"
                value={filterUsername}
                onChange={(e) => {
                  setFilterUsername(e.target.value);
                  if (!e.target.value) {
                    fetchAllUsers();
                  }
                }}
                onBlur={fetchFilteredUsers}
                className="Settings-input"
              />
            </div>
            <div className="Settings-filters">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={filterEmail}
                onChange={(e) => {
                  setFilterEmail(e.target.value);
                  if (!e.target.value) {
                    fetchAllUsers();
                  }
                }}
                onBlur={fetchFilteredUsers}
                className="Settings-input"
              />
            </div>
            <div className="Settings-filters">
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  if (!e.target.value) {
                    fetchAllUsers();
                  }
                }}
                onBlur={fetchFilteredUsers}
                className="Settings-select"
              >
                <option value="">Selecciona un rol</option>
                <option value="visitante">Visitante</option>
                <option value="lector">Lector</option>
                <option value="editor">Editor</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div className="Settings-filters">
              <label>
                <input
                  type="checkbox"
                  checked={filterUserState === "1"}
                  onChange={(e) => {
                    const newState = e.target.checked ? "1" : null;
                    setFilterUserState(newState);
                    if (!newState) {
                      fetchAllUsers();
                    }
                  }}
                  onBlur={fetchFilteredUsers}
                  className="Settings-input"
                />
                Eliminados
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filterUserState === "0"}
                  onChange={(e) => {
                    const newState = e.target.checked ? "0" : null;
                    setFilterUserState(newState);
                    if (!newState) {
                      fetchAllUsers();
                    }
                  }}
                  onBlur={fetchFilteredUsers}
                  className="Settings-input"
                />
                Activos
              </label>
            </div>

            {users.map((user, index) => (
            <div 
              className={`Settings-card ${user.estado === "1" ? "Settings-card-inactive" : ""}`} 
              key={index} 
              onClick={() => handleCardClick(user)}
            >
              <p className="Settings-dcard">
                <span className="material-icons">account_circle</span>{" "}
                <strong>{user.username}</strong>
              </p>
              <p className="Settings-dcard">
                <span className="material-icons">email</span> {user.email}
              </p>
              <p className="Settings-dcard">
                <span className="material-icons">privacy_tip</span> {user.perfil}
              </p>
            </div>
          ))}
          </div>

          <div className="Settings-right-column">
            <div className="Settings-dats">
              <h2>{isEditing ? "Actualizar usuario" : "Registrar usuario"}</h2>
            </div>
            
            {alertMessage && (
              <div className={`Settings-alert-box ${alertType}`}>
                {alertMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {errorMessage && <p className="Settings-error-message">{errorMessage}</p>}
              
              <div className="Settings-input-group">
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  required
                  className="Settings-input"
                />
              </div>
              <div className="Settings-input-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="Settings-input"
                />
              </div>
              <div className="Settings-input-group">
                <input
                  type="password"
                  placeholder={isEditing ? "Cambiar Contraseña" : "Contraseña"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="Settings-input"
                />
              </div>
              <div className="Settings-input-group">
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  required
                  className="Settings-select"
                >
                  <option value="">Selecciona un rol</option>
                  <option value="visitante">Visitante</option>
                  <option value="lector">Lector</option>
                  <option value="editor">Editor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>

              <div className="Settings-botones">
                <button 
                  type="submit" 
                  className="Settings-button-submit"
                  disabled={userState === 1}
                  style={{ 
                    cursor: userState === 1 ? "not-allowed" : "pointer", 
                    opacity: userState === 1 ? 0.5 : 1 
                  }}
                >
                  {isEditing ? "Actualizar" : "Registrar"}
                </button>
                <button 
                  type="button" 
                  className="Settings-button-back"
                  onClick={handleToggleUserState} 
                  disabled={!isEditing}
                  style={{ 
                    cursor: !isEditing ? "not-allowed" : "pointer", 
                    opacity: !isEditing ? 0.5 : 1 
                  }}
                >
                  {userState === 0 ? "Eliminar" : "Activar"}
                </button>
                <button 
                  type="button" 
                  className="Settings-button-clear"
                  onClick={handleClear}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
