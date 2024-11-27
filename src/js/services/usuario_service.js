import { d, ruta } from '../constantes.js';

d.addEventListener("DOMContentLoaded", () => {
    const form = d.getElementById("loginForm");

    form.addEventListener("submit", (event) => {
        event.preventDefault(); 

        const nombre = form.querySelector("input[name='usuario']").value.trim();
        const apellido = form.querySelector("input[name='usuario-ape']").value.trim();
        const telefono = form.querySelector("input[name='usuario-tel']").value.trim();
        const correoElectronico = form.querySelector("input[name='usuario-email']").value.trim();
        const contrasena = form.querySelector("input[name='password']").value.trim();

      
        const usuario = {
            nombre: nombre,
            apellido: apellido,
            telefono: parseInt(telefono),
            correoElectronico: correoElectronico,
            contrasena: contrasena,
            status: true
        };

        console.log(usuario);

      
        const token = localStorage.getItem("authToken");

       
        fetch(ruta + "usuarios/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(usuario)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al registrar el usuario");
            }
            return response.json();
        })
        .then(data => {
            console.log("Usuario registrado con éxito:", data);
            Swal.fire({
                icon: "success",
                title: "Usuario registrado",
                text: "El usuario ha sido registrado correctamente.",
                confirmButtonText: "Aceptar"
            }).then(() => {
                form.reset(); 
            });
        })
        .catch(error => {
            console.error("Error en la petición:", error);

          
            Swal.fire({
                icon: "error",
                title: "Error al registrar el usuario",
                text: "Ocurrió un problema al registrar el usuario. Por favor, verifica los datos e inténtalo de nuevo.",
                confirmButtonText: "Reintentar"
            });
        });
    });
});
