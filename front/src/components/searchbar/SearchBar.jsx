import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  // Leer el perfil del usuario desde localStorage
  const userProfile = parseInt(localStorage.getItem("perfil"),10);
  const name = localStorage.getItem("usuario");
  const navigate = useNavigate();
  const handleSearch = () => {
    onSearch(query.trim().toLowerCase());
  };

  return (
    <nav className="search-bar">
      <div className="user-name"> {name} </div>
      <input
        type="text"
        placeholder="Buscar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <div className="search-buttons">
        <button className="search-button" onClick={handleSearch}>
          <span className="material-icons">search</span>
        </button>
        <button className="Home-button">
          <span class="material-icons"
          onClick={()=> navigate("/books")}>book</span>
        </button>
        { (userProfile === 1 || userProfile === 2) && ( 
        <button className="upload-button">
          <span className="material-icons"
          onClick={()=> navigate("/archive")}>file_upload</span>
        </button>
        )}
        <button className="profile-button"
          onClick={()=> navigate("/profile")}>
          <span className="material-icons">account_circle</span>
        </button>
        {userProfile === 1 && ( // Solo muestra el botón si el usuario es admin
          <button className="settings-button"
          onClick={() => navigate("/settings")}>
            <span className="material-icons">settings</span>
          </button>
        )}
        <button className="close-session"
          onClick={() => {
            localStorage.clear();//borra los datos
            navigate("/");
          }}>
          <span class="material-icons">logout</span>
        </button>
      </div>
    </nav>
  );
}

export default SearchBar;
