import { useEffect, useState } from "react";
import "./Settings.css"

function Settings() {

  return (
    <div className="space">
        <div className="columns">
        <div className="left-column">
        <div className="card">
          <h3>Título de la Tarjeta</h3>
          <p>Este es el contenido de la tarjeta. Puedes agregar más información aquí.</p>
        </div>
        </div>
        <div className="right-column">
          <h2>Columna Derecha (30%)</h2>
        </div>
      </div>
    </div>
  );

}

export default Settings;
