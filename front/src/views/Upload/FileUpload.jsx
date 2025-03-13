import React, { useState } from "react";
import "./FileUpload.css"; // Agrega estilos si los necesitas

function FileUpload({ onClose, onUpload }) {
    const [file, setFile] = useState(null);
    const [usuarioAlt, setUsuarioAlt] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Selecciona un archivo CSV.");
            return;
        }
    
        const loggedUser = localStorage.getItem("usuario");
    
        // Verifica que el usuarioAlt tiene el valor correcto
        console.log("Usuario alternativo:", loggedUser.toUpperCase());
    
        const formData = new FormData();
        formData.append("file", file);
    
        // Añadir el usuarioAlt al FormData
        formData.append("usuarioAlt", loggedUser.toUpperCase());
    
        try {
            const response = await fetch("http://127.0.0.1:8000/api/libros/carga_masiva/", {
                method: "POST",
                body: formData,
            });
    
            if (response.ok) {
                alert("Archivo subido correctamente.");
                onUpload();  // Refresca la lista de libros
                onClose();   // Cierra el modal
            } else {
                alert("Error al subir el archivo.");
            }
        } catch (error) {
            alert("Error de conexión con el servidor.");
        }
    };

    const downloadTemplate = () => {
        const template = [
            ["Titulo", "Autor", "Resena", "Imagen"],
            ["","","","Puedes dejarlo en blanco y despues llenarlo o copiar la direccion de la imagen de alguna en internet y pegarla completa"]  // Encabezados de columnas
        ];

        const csvContent = template.map((row) => row.join(",")).join("\n");

        // Crear un enlace de descarga
        const link = document.createElement("a");
        const blob = new Blob([csvContent], { type: "text/csv" });
        link.href = URL.createObjectURL(blob);
        link.download = "plantilla_libros.csv";
        link.click();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Botón de Cerrar X */}
                <button className="modal-close" onClick={onClose}>X</button>

                <h2>Carga Masiva de Libros</h2>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                
                <div className="modal-buttons">
                    <button onClick={handleUpload} className="modal-subir">Subir Archivo</button>
                    <button onClick={downloadTemplate} className="modal-descargar">Descargar Plantilla CSV</button>
                    <button className="modal-example">Ejemplo de plantilla</button>
                </div>
            </div>
        </div>
    );
}

export default FileUpload;
