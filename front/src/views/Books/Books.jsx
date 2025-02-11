import { useEffect, useState } from "react";

function Home() {
  const [message, setMessage] = useState("Cargando...");

  /*useEffect(() => {
    fetch("http://127.0.0.1:8000/api/hello/")
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error("Error:", error));
  }, []);*/

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Mensaje de django: {message}</h1>
    </div>
  );
}

export default Home;
