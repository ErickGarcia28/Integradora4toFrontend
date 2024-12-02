import { d, ruta, w } from "./constantes.js";


d.addEventListener("DOMContentLoaded", () => {

    const $btnCierre = d.getElementById("cerrarSesionBtn");

    $btnCierre.addEventListener("click",()=>{
        localStorage.removeItem("authToken");
        localStorage.removeItem("categoryId");
        localStorage.removeItem("eventoDetalles");
        localStorage.removeItem("eventoId");
        localStorage.removeItem("usuarioId");
      
        // Redirigir al login
        Swal.fire({
          icon: "success",
          title: "Sesión cerrada",
          text: "Tu sesión ha sido cerrada exitosamente.",
          confirmButtonText: "Aceptar",
        }).then(() => {
          window.location.href = "index.html";
        });
    });
});

