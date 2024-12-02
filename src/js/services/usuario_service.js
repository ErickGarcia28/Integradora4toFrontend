import { d, ruta, w, c } from "../constantes.js";

d.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    w.location.href = "login.html";
  }

  const $registerForm = document.getElementById("registerForm");

  if ($registerForm) {
    $registerForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const nombre = document.getElementById("inputNombreRegistro").value;
      const apellido = document.getElementById("inputApellidosRegistro").value;
      const telefono = document.getElementById("inputTelefonoRegistro").value;
      const correo = document.getElementById("inputCorreoRegistro").value;
      const contrasena = document.getElementById("inputContraRegistro").value;

      const usuarioDTO = {
        nombre: nombre,
        apellido: apellido,
        correoElectronico: correo,
        telefono: parseInt(telefono),
        contrasena: contrasena,
        status: true,
      };

      fetch(ruta + "usuarios/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuarioDTO),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.type === "SUCCESS") {
            Swal.fire({
              title: "¡Éxito!",
              text: "Usuario registrado correctamente.",
              icon: "success",
              confirmButtonText: "Aceptar",
            }).then(() => {
              document.getElementById("registerForm").reset();
              w.location.href = "verUsuarios.html";
            });
          } else {
            Swal.fire({
              title: "Error",
              text: data.mensaje || "Hubo un problema al registrar el usuario.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          }
        })
        .catch((error) => {
          console.error("Error al registrar el usuario:", error);
          Swal.fire({
            title: "Error",
            text: "Hubo un problema con la solicitud. Por favor, inténtalo más tarde.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        });
    });
  }

  const $users_container = d.getElementById("usuarios_container");

  fetch(ruta + "usuarios/all", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      return res.json();
    })
    .then((data) => {
      console.log(data.result);
      data.result.forEach((usuario) => {
        const $card_user = d.createElement("div");
        $card_user.classList.add("card");
        $card_user.innerHTML = `
        
          <div class="card-content">
            <h3>${usuario.nombre}</h3>
            <p>${usuario.correoElectronico}</p>
            <p>${usuario.telefono}</p>
            <p><strong>Estado:</strong> ${
              usuario.status ? "Activo" : "Deshabilitado"
            }</p>
          
          <div class="more-info">
            <button id="btn-status-${usuario.id}" class="btn-status ${
          usuario.status ? "btn-red" : "btn-green"
        }">
              ${usuario.status ? "DESHABILITAR" : "ACTIVAR"}
            </button>
            <button id="btn-editar${
              usuario.id
            }" class="btn-details"><a href="actUsuario.html">EDITAR</a></button>
          </div>
        </div>
      `;

        if ($users_container) {
          $users_container.appendChild($card_user);
        }

        const botonEstado = d.getElementById(`btn-status-${usuario.id}`);
        const btnDetails = d.getElementById(`btn-editar${usuario.id}`);

        if (botonEstado) {
          botonEstado.addEventListener("click", () => {
            cambiarEstado(usuario.id, usuario.status);
          });
        }

        if (botonEstado) {
          btnDetails.addEventListener("click", () => {
            localStorage.setItem("usuarioId", usuario.id);
            console.log(
              `Categoría con id ${usuario.id} guardada en localStorage.`
            );
          });
        }
      });
    });

  function cambiarEstado(usuarioId, estadoActual) {
    const token = localStorage.getItem("authToken");
    const nuevoEstado = !estadoActual;

    fetch(ruta + "usuarios/change-status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: usuarioId,
        status: nuevoEstado,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cambiar el estado del usuario");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Estado del usuario actualizado:", data);

        const botonEstado = document.getElementById(`btn-status-${usuarioId}`);
        if (nuevoEstado) {
          botonEstado.innerHTML = "DESHABILITAR";
          botonEstado.classList.remove("btn-green");
          botonEstado.classList.add("btn-red");
        } else {
          botonEstado.innerHTML = "ACTIVAR";
          botonEstado.classList.remove("btn-red");
          botonEstado.classList.add("btn-green");
        }
        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: "Estado de usuario actualizado",
          confirmButtonText: "Aceptar",
        }).then(() => {
          window.location.reload();
        });

      })
      .catch((error) => {
        console.error("Error al cambiar el estado:", error);

        Swal.fire({
          icon: "error",
          title: "Error al cambiar el estado",
          text: "Ocurrió un problema al cambiar el estado del usuario. Por favor, intenta de nuevo.",
          confirmButtonText: "Reintentar",
        });
      });
  }
  function cargarInfoUsuario() {
    const usuarioId = localStorage.getItem("usuarioId");
    if (usuarioId) {
      console.log(`Recuperado id de usuario: ${usuarioId}`);
      fetch(ruta + "usuarios/" + usuarioId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          document.getElementById("inputNombreActualizacion").value =
            data.result.nombre;
          document.getElementById("inputApellidosActualizacion").value =
            data.result.apellido;
          document.getElementById("inputTelefonoActualizacion").value =
            data.result.telefono;
          document.getElementById("inputCorreoActualizacion").value =
            data.result.correoElectronico;
        })
        .catch((error) => {
          console.error("Error al obtener los datos del usuario:", error);
        });
    }
  }

  cargarInfoUsuario();

  const $btnActualizar = document.getElementById("actualizar-usuario-btn");
  if ($btnActualizar) {
    $btnActualizar.addEventListener("click", actualizarUsuario);
  }

  function actualizarUsuario() {
    const nombre = document
      .getElementById("inputNombreActualizacion")
      .value.trim();
    const apellido = document
      .getElementById("inputApellidosActualizacion")
      .value.trim();
    const telefono = document
      .getElementById("inputTelefonoActualizacion")
      .value.trim();
    const correoElectronico = document
      .getElementById("inputCorreoActualizacion")
      .value.trim();

    if (!nombre || !apellido || !telefono || !correoElectronico) {
      Swal.fire({
        icon: "error",
        title: "Campos vacíos",
        text: "Por favor, completa todos los campos.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha encontrado el ID del usuario.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const usuario = {
      id: usuarioId,
      nombre: nombre,
      apellido: apellido,
      telefono: parseInt(telefono),
      correoElectronico: correoElectronico,
    };

    console.log("Usuario antes de actualizar", usuario);

    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    fetch(ruta + "usuarios/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(usuario),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al actualizar el usuario");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Usuario actualizado con éxito:", data);

        Swal.fire({
          icon: "success",
          title: "Usuario actualizado",
          text: "La información del usuario ha sido actualizada correctamente.",
          confirmButtonText: "Aceptar",
        }).then(() => {
          window.location.href = "verUsuarios.html";
        });
      })
      .catch((error) => {
        console.error("Error en la petición:", error);

        Swal.fire({
          icon: "error",
          title: "Error al actualizar el usuario",
          text: "Ocurrió un problema al actualizar el usuario. Intenta nuevamente.",
          confirmButtonText: "Reintentar",
        });
      });
  }
});
