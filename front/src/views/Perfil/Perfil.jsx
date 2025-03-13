import { useEffect, useState } from "react";
import "./Perfil.css";
import perfilImage from "../../assets/perfilxd.png";

function Perfil() {

    const [usuarioAlt, setUsuarioAlt] = useState('');
    const [userData, setUserData] = useState(null); // Estado para almacenar los datos del usuario

    useEffect(() => {
        // Obtener el user_id de localStorage y pasar al fetch
        const userId = localStorage.getItem("user_id"); // Suponiendo que el user_id está almacenado en localStorage
        console.log(userId);
        if (userId) {
            fetchGetUser(userId); // Llama a la función con el ID de usuario
        }
    }, []);

    const fetchGetUser = async (userId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/get_user/${userId}/`); // Incluye el userId en la URL
            const data = await response.json();
            console.log(data);
            setUserData(data); // Almacena los datos del usuario en el estado
        } catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
        }
    };

    return (
        <div className="Perfil-space">
            <div className="Perfil-grid">
                <div className="Perfil-columns">
                    <div className="Perfil-circle">
                        <img src={perfilImage} alt="Perfil" className="Perfil-img" />
                    </div>
                    <div className="Perfil-name">
                        <span className="material-icons icon-large">account_circle</span> 
                        {userData ? userData.usuario : "Cargando..."} {/* Muestra el usuario */}
                    </div>
                    <div className="Perfil-correo">
                        <span className="material-icons icon-large">email</span> 
                        {userData ? userData.correo : "Cargando..."} {/* Muestra el correo */}
                    </div>
                    <div className="Perfil-Perfil">
                        <span className="material-icons icon-large">privacy_tip</span> 
                        {userData ? userData.perfil : "Cargando..."} {/* Muestra el perfil */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;
