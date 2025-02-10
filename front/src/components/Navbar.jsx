import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", textAlign: "center" }}>
      <Link to="/" style={{ marginRight: "15px" }}>Inicio</Link>
      <Link to="/about">Acerca de</Link>
    </nav>
  );
}

export default Navbar;
