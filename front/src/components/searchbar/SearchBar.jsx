import { useState } from "react";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

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
          <span class="material-icons">search</span>
        </button>
        <button className="upload-button">
          <span class="material-icons">file_upload</span>
        </button>
        <button className="profile-button">
          <span class="material-icons">account_circle</span>
        </button>
        <button className="settings-button">
          <span class="material-icons">settings</span>
        </button>
      </div>
    </nav>
  );
}

export default SearchBar;
