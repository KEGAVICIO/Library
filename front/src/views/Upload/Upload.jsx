import { useEffect, useState } from "react";
import "./Upload.css";

function Upload() {
    const [titulo, setTitulo] = useState("");
    const [autor, setAutor] = useState("");
    const [resena, setResena] = useState("");
    const [imagen, setImagen] = useState(null);

    const handleImageChange = (e) => {
        setImagen(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("autor", autor);
        formData.append("resena", resena);
        formData.append("imagen", imagen);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/libros/", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Libro subido exitosamente");
                setTitulo("");
                setAutor("");
                setResena("");
                setImagen(null);
            } else {
                alert("Error al subir el libro");
            }
        } catch (error) {
            console.error("Error en la subida:", error);
        }
    };


    return (
        <div className="Upload-espacio">
            <div className="Upload-space">
                <div className="Upload-columns">
                    <div className="Upload-left-column">

                    </div>

                    <div className="Upload-middle-column">
                        <div className="Upload-dats">
                            <h2 className="Upload-tittle">Registrar Libro</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="Upload-input-group">
                                    <input
                                        type="text"
                                        placeholder="Título del libro"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
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
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="Upload-button">Subir Libro</button>
                            </form>
                        </div>
                    </div>

                    <div className="Upload-right-column">

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Upload;