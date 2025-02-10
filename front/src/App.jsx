import AppRouter from './Routes/AppRouter';

function App() {
  return <AppRouter />;
}

export default App;


/*import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState("Cargando...")

  // Realiza una solicitud a la API de Django al cargar el componente
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/hello/")  // La URL de tu API Django
      .then(response => response.json())  // Convierte la respuesta en JSON
      .then(data => setMessage(data.message))  // Guarda el mensaje en el estado
      .catch(error => console.error("Error:", error))  // Maneja errores
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{message}</h1>  {/* Muestra el mensaje de Django *//*}
    </div>
  )
}

export default App*/
