import { useEffect, useState } from "react";
import "./Books.css";

function Home() {
  const [books, setBooks] = useState([]);  // Arreglo para almacenar los libros
  const [usuarioAlt, setUsuarioAlt] = useState("");

  // Trae los usuarios y los libros
  useEffect(() => {
    const loggedUser = localStorage.getItem("usuario");
    if (loggedUser) {
      setUsuarioAlt(loggedUser.toUpperCase());
    }
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/libros/listap/");
      const data = await response.json();
      setBooks(data);  // Guarda los libros en el estado
    } catch (error) {
      showAlert("Error al obtener libros:", error);
    }
  };

  return (
    <div className="Books-space">
      <div className="Books-espacio">
        <div className="Books-columns">
          {/* Mapea sobre el arreglo de libros y renderiza una tarjeta para cada libro */}
          {books.map((book) => (
            <div key={book.IdLibro} className="Books-cards">
              <div>
                {/* Asegúrate de que la imagen se cargue correctamente */}
                {book.imagen && (
                  <img 
                    src={`data:image/png;base64,${book.imagen}`} 
                    alt={book.titulo} 
                    className="Book-image" 
                  />
                )}
                <h3>{book.titulo}</h3>
                <p><strong>Autor:</strong> {book.autor}</p>
                <p><strong>Vistas:</strong> {book.vistas}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
