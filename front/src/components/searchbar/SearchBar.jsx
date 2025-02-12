import { useState } from "react";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  // Leer el perfil del usuario desde localStorage
  const userProfile = parseInt(localStorage.getItem("perfil"),10);
  console.log("datos search", userProfile)
  const handleSearch = () => {
    onSearch(query.trim().toLowerCase());
  };

  return (
    <nav className="search-bar">
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
        <button className="upload-button">
          <span className="material-icons">file_upload</span>
        </button>
        <button className="profile-button">
          <span className="material-icons">account_circle</span>
        </button>
        {userProfile === 1 && ( // Solo muestra el botón si el usuario es admin
          <button className="settings-button">
            <span className="material-icons">settings</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default SearchBar;
