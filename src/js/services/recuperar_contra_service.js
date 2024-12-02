import { d, ruta, w } from "../constantes.js";

d.addEventListener("DOMContentLoaded", () => {
  const form = d.getElementById("recuperarContrForm");

 
  if(form){
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); 
    
        const emailInput = d.getElementById('correoRecuperacion');
        const correo = emailInput?.value.trim();
    
        if (!correo) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, ingresa un correo válido.",
          });
          return;
        }
    
        try {
          const response = await fetch(`${ruta}usuarios/send-email/${correo}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Hubo un error al enviar el correo.");
          }
    
          const data = await response.json();
          Swal.fire({
            icon: "success",
            title: "Correo Enviado",
            text: data.message || "Se ha enviado un correo con las instrucciones de recuperación.",
          }).then(() => {
            localStorage.setItem("usuarioId",data.result.id );
            w.location.href = "validar-codigo.html";
          });
          
        } catch (error) {
          console.error("Error al enviar el correo:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "No se pudo enviar el correo. Intenta nuevamente.",
          });
        }
      });
  }


  const formValidarCodigo = d.getElementById("validarCodigo");

  if (formValidarCodigo) {
    formValidarCodigo.addEventListener("submit", async (e) => {
      e.preventDefault(); 

      const codigoInput = d.getElementById("codigo");
      const codigo = codigoInput?.value.trim();

      if (!codigo) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor, ingresa un código válido.",
        });
        return;
      }

      try {
        
        const response = await fetch(`${ruta}usuarios/verify-code/${codigo}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Hubo un error al validar el código.");
        }

        const data = await response.json();

        
        Swal.fire({
          icon: "success",
          title: "Código Verificado",
          text: data.message || "El código se verificó correctamente.",
        }).then(() => {
            console.log(data.result);
            localStorage.setItem("correoRecuperacion", data.result.correoElectronico);
          w.location.href = "cambiar-contra.html";
        });
      } catch (error) {
        console.error("Error al validar el código:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo validar el código. Intenta nuevamente.",
        });
      }
    });
  }



  const formCambioContrasena = d.getElementById("cambioDeContra");

  if (formCambioContrasena) {
    formCambioContrasena.addEventListener("submit", async (e) => {
      e.preventDefault(); 

      const nuevaContrasenaInput = d.getElementById("nuevaContrasena");
      const confirmarContrasenaInput = d.getElementById("confirmarContrasena");

      const nuevaContrasena = nuevaContrasenaInput.value.trim();
      const confirmarContrasena = confirmarContrasenaInput.value.trim();
      const correo = localStorage.getItem("correoRecuperacion"); 

      
      if (!nuevaContrasena || !confirmarContrasena) {
        Swal.fire({
          icon: "error",
          title: "Campos Vacíos",
          text: "Por favor, completa ambos campos.",
        });
        return;
      }

      if (nuevaContrasena !== confirmarContrasena) {
        Swal.fire({
          icon: "error",
          title: "Contraseñas No Coinciden",
          text: "Las contraseñas ingresadas no son iguales. Inténtalo nuevamente.",
        });
        return;
      }

      if (!correo) {
        Swal.fire({
          icon: "error",
          title: "Correo no Encontrado",
          text: "No se encontró un correo asociado. Intenta nuevamente desde la recuperación.",
        });
        return;
      }

      
      const payload = {
        correoElectronico: correo,
        nuevaContrasena: nuevaContrasena,
      };

      try {
        
        const response = await fetch(`${ruta}usuarios/update-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al cambiar la contraseña.");
        }

        const data = await response.json();
        Swal.fire({
          icon: "success",
          title: "Contraseña Cambiada",
          text: data.message || "Tu contraseña se ha cambiado exitosamente.",
        }).then(() => {
          localStorage.removeItem("correoRecuperacion"); 
          w.location.href = "login.html"; 
        });
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo cambiar la contraseña. Intenta nuevamente.",
        });
      }
    });
  }
});
