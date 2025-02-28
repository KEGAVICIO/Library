import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "../views/Login/Login";
import Books from "../views/Books/Books";
import Register from "../views/Register/Register";
import SearchBar from "../components/searchbar/SearchBar";
import Settings from "../views/Settings/Settings";
import Perfil from "../views/Perfil/Perfil";
import Archivos from "../views/Upload/Upload";

function AppContent() {
    const location = useLocation(); // Obtiene la ruta actual

    const handleSearch = (query) => {
        console.log("Buscando:", query);
    };

    return (
        <div>
            {/* Mostrar SearchBar solo si NO estamos en Login */}
            {(location.pathname != "/registre" && location.pathname !== "/") && <SearchBar onSearch={handleSearch} />}

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registre" element={<Register />} />
                <Route path="/books" element={<Books />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Perfil />}/>
                <Route path="/archive" element={<Archivos/>} />
            </Routes>
        </div>
    );
}

function AppRouter() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default AppRouter;
