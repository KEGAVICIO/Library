import { useEffect, useState, useRef } from "react";
import "./Upload.css";
import FileUpload from "./FileUpload.jsx";


function Upload() {
    const [titulo, setTitulo] = useState("");
    const [autor, setAutor] = useState("");
    const [resena, setResena] = useState("");
    const [imagen, setImagen] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [bookState, setBookState] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const [books, setBooks] = useState([]);
    const [editing, setEditing] = useState(false);
    const [selectedBookId, setSelectedBookId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);


    const [usuarioAlt, setUsuarioAlt] = useState("");
    // Referencia al input file
    const fileInputRef = useRef(null);

    //trae lo usuarios
    useEffect(() => {
        const loggedUser = localStorage.getItem("usuario");
        if (loggedUser) {
            setUsuarioAlt(loggedUser.toUpperCase());
          }
        fetchAllBooks();
      }, []);
      
    const fetchAllBooks = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/libros/lista/");
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            showAlert("Error al obtener libros:", error);
        }
    };
    
    // Cuando se selecciona un libro, llena los campos del formulario
    const handleSelectBook = (book) => {
        setTitulo(book.titulo);
        setAutor(book.autor);
        setResena(book.resena);
        setBookState(Number(book.estado));
        setEditing(true);
        setSelectedBookId(book.id);
    };

    const showAlert = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => {
            setAlertMessage("");
            setAlertType("");
        }, 2000);
    };
      
      //valida que la imagen sea del formato que pedi
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
            if (!validTypes.includes(file.type)) {
                showAlert("Formato no válido. Solo JPG, PNG o GIF.", "error");
                return;
            }
            setImagen(file);
        }
    };

    //para subir un libro
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!titulo || !autor || !resena) {
            showAlert("Todos los campos son obligatorios.", "error");
            return;
        }
    
        const loggedUser = localStorage.getItem("usuario") || "SISTEMA";
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("autor", autor);
        formData.append("resena", resena);
        formData.append("usuarioAlt", loggedUser.toUpperCase());
    
        // Solo agrega la imagen si se seleccionó una nueva
        if (imagen) {
            formData.append("imagen", imagen);
        }
    
        try {
            const url = editing 
                ? `http://127.0.0.1:8000/api/libros/${selectedBookId}/`
                : "http://127.0.0.1:8000/api/libros/";
    
            const method = editing ? "PUT" : "POST";
    
            const response = await fetch(url, {
                method: method,
                body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok) {
                showAlert(editing ? "Libro actualizado exitosamente." : "Libro registrado exitosamente.", "success");
                handleClear();
                fetchAllBooks();
            }
            else{
                showAlert(data.message || "Error al procesar la solicitud.", "error");
            }
        } catch (error) {
            showAlert("Error al conectar con el servidor.", "error");
        }
    };

    const handleClear = () => {
        setTitulo("");
        setAutor("");
        setResena("");
        setImagen(null);
        setEditing(false);
        setSelectedBookId(null);

        // Limpiar el input file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    //para cambiar el estado
    const handleToggleBookState = async () => {
        const newState = bookState === 0 ? 1 : 0;
        try {
          const formData = new FormData();
          formData.append("titulo", titulo);
          formData.append("autor", autor);
          formData.append("resena", resena);
          formData.append("estado", newState.toString());
          formData.append("usuarioAlt", usuarioAlt);
      
          const response = await fetch(`http://127.0.0.1:8000/api/libros/${selectedBookId}/`, {
            method: "PUT",
            body: formData,
          });
      
          if (response.ok) {
            const data = await response.json();
            showAlert(newState === 1 ? "Libro desactivado" : "Libro activado", "success");
            setBookState(newState); // Actualiza el estado en la UI
            fetchAllBooks(); // Refresca la lista de libros
          } else {
            const data = await response.json();
            showAlert(data.message || "Error al actualizar el estado del libro.", "error");
          }
        } catch (error) {
          showAlert("Error al actualizar el estado del libro", "error");
        }
      };

    return (
        <div className="Upload-espacio">
            <div className="Upload-space">
                <div className="Upload-columns">
                {alertMessage && <div className={`Upload-alert ${alertType}`}>{alertMessage}</div>}
                    <div className="Upload-left-column">
                        <div className="Books-container">
                        {books.map((book, index) => (
                            <div key={index} className={`Book-card ${book.estado === "1" ? "Book-card-inactive" : ""}`}
                                onClick={() => handleSelectBook(book)}>
                                <img 
                                    src={`data:image/png;base64,${book.imagen}`} 
                                    alt={book.titulo} 
                                    className="Book-image" 
                                />
                                <h3>{book.titulo}</h3>
                                <p><strong>Autor:</strong> {book.autor}</p>
                                <p><strong>Vistas:</strong>{book.vistas}</p>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="Upload-middle-column">
                        <div className="Upload-dats">
                            <h2 className="Upload-tittle">{editing ? "Actualizar Libro" : "Registrar Libro"}</h2>
                            {mensaje && <p className="Upload-mensaje">{mensaje}</p>}
                            <form onSubmit={handleSubmit}>
                                <div className="Upload-input-group">
                                    <input
                                        type="text"
                                        placeholder="Título del libro"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                <div className="Upload-input-group">
                                    <input
                                        type="text"
                                        placeholder="Autor"
                                        value={autor}
                                        onChange={(e) => setAutor(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="Upload-input-group">
                                    <textarea
                                        placeholder="Reseña"
                                        value={resena}
                                        onChange={(e) => setResena(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <div className="Upload-input-group">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/gif"
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                    />
                                </div>
                                <button type="submit" className="Upload-button">{editing ? "Actualizar Libro" : "Subir Libro"}</button>
                            </form>
                        </div>
                    </div>

                    <div className="Upload-right-column">
                        <button type="button" className="Upload-Masivos" onClick={() => setIsModalOpen(true)}>Carga Masiva</button>
                        <button type="button" className="Upload-Eliminar"
                            onClick={handleToggleBookState} 
                            disabled={!editing}>{bookState === 0 ? "Desactivar Libro" : "Activar Libro"}</button>
                        <button type="button" className="Upload-Clear" onClick={handleClear}
                            >Limpiar</button>
                    </div>
                    {isModalOpen && <FileUpload onClose={() => setIsModalOpen(false)} onUpload={fetchAllBooks} />}
                </div>
            </div>
        </div>
    );
}

export default Upload;
