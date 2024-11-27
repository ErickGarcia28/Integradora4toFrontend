
import { d, ruta } from '../constantes.js';

const $correoInput = d.getElementById("inputLogin");
const $contraInput = d.getElementById("inputPass");


function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(atob(base64Url).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(base64);
}

d.addEventListener("DOMContentLoaded", () => {
    const login = (event) => {
        event.preventDefault(); 

        fetch(ruta + "auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: $correoInput.value,
                contrasena: $contraInput.value
            })
        })
        .then(res => res.text()) 
        .then(data => {
            console.log("Token recibido:", data);
            
           
            localStorage.setItem("authToken", data);
            console.log("Token guardado en localStorage");

           
            const decodedToken = parseJwt(data);
            console.log("Token decodificado:", decodedToken);

            const role = decodedToken.role; 
            console.log("Rol del usuario:", role);

            if(role== "SUPERADMIN"){
                window.location.href = "principalSuperAdmin.html";
                }
            else if(role == "ADMIN"){
                    window.location.href = "principalAdmin.html";
            }else{
                    Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes los permisos necesarios para acceder.',
                    confirmButtonText: 'Aceptar',
                });    
            }
        })
        .catch(err => {
            console.error("Error en la petición:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error al iniciar sesión',
                text: 'Por favor verifica tus credenciales.',
                confirmButtonText: 'Reintentar',
            });
        });
    };

    const loginButton = d.getElementById("loginButton");
    if (loginButton) {
        loginButton.addEventListener("click", login);
    }
});
