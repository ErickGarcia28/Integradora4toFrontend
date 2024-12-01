import { d, ruta, w } from "../constantes.js";

d.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  const $formRegistro = d.getElementById("registroParticipanteForm");
  const eventoId = localStorage.getItem("eventoDetalles");

  if (!eventoId) {
    Swal.fire({
      icon: "warning",
      title: "Evento no encontrado",
      text: "No se ha seleccionado un evento válido para el registro.",
    });
    return;
  }

  if ($formRegistro) {
    $formRegistro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData($formRegistro);
      const participante = {
        nombre: formData.get("usuario"),
        apellido: formData.get("usuario-ape"),
        telefono: parseInt(formData.get("usuario-tel"), 10),
        correoElectronico: formData.get("usuario-email"),
        direccion: formData.get("usuario-direccion"),
        eventoId: parseInt(eventoId, 10),
        status: true,
      };

      try {
        if (!participante.nombre || participante.nombre.length > 50) {
          throw new Error(
            "El nombre es obligatorio y no debe exceder los 50 caracteres."
          );
        }
        if (!participante.apellido || participante.apellido.length > 80) {
          throw new Error(
            "Los apellidos son obligatorios y no deben exceder los 80 caracteres."
          );
        }
        if (
          !participante.telefono ||
          participante.telefono.toString().length !== 10
        ) {
          throw new Error("El teléfono debe tener exactamente 10 dígitos.");
        }
        if (
          !participante.correoElectronico ||
          participante.correoElectronico.length > 74
        ) {
          throw new Error(
            "El correo electrónico es obligatorio y no debe exceder los 74 caracteres."
          );
        }
        if (!participante.direccion || participante.direccion.length > 250) {
          throw new Error(
            "La dirección es obligatoria y no debe exceder los 250 caracteres."
          );
        }

        const response = await fetch(`${ruta}participantes/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(participante),
        });
        if (response.ok) {
          const result = await response.json();
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: result.message || "Te registraste exitosamente en el evento!",
          }).then(() => {
            localStorage.removeItem("eventoDetalles");
            $formRegistro.reset();
            window.location.href = "index.html";
          });
        } else {
          const error = await response.json();
          Swal.fire(
            "Error",
            error.message || "No se pudo registrar el participante",
            "error"
          );
        }
      } catch (err) {
        console.error("Error al registrar participante:", err);
        Swal.fire(
          "Error",
          err.message || "Ocurrió un error inesperado",
          "error"
        );
      }
    });
  }

  const cardsContainer = d.querySelector(".cards-container");

  const cargarParticipantes = async () => {
    try {
      const response = await fetch(
        `${ruta}participantes/get-by-eventId/${eventoId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        cardsContainer.innerHTML = `
          <div class="no-results-message">
            Este evento no tiene participantes registrados aún.
          </div>`;
        return;
      }

      if (!response.ok) {
        throw new Error("Error al cargar los participantes.");
      }

      const data = await response.json();
      const participantes = data.result;

      cardsContainer.innerHTML = "";

      if (!participantes || participantes.length === 0) {
        cardsContainer.innerHTML = `
          <div class="no-results-message">
            Este evento no tiene participantes registrados aún.
          </div>`;
        return;
      }

      participantes.forEach((participante) => {
        const cardHTML = `
          <div class="card">
            <div class="card-content">
              <h3>${participante.nombre} ${participante.apellido}</h3>
              <p>Email: ${participante.correoElectronico}</p>
              <p>Tel: ${participante.telefono}</p>
              <p>Dirección: ${participante.direccion}</p>
            </div>
            <div class="more-info">
              <button id="btn-status-${participante.id}" class="btn-status ${
          participante.status ? "btn-red" : "btn-green"
        }" data-id="${participante.id}" data-status="${participante.status}">
                ${participante.status ? "DESHABILITAR" : "ACTIVAR"}
              </button>
                      <button class="btn-details" data-id="${
                        participante.id
                      }">EDITAR</button>
            </div>
          </div>
        `;

        const cardElement = document.createElement("div");
        cardElement.innerHTML = cardHTML;
        cardsContainer.appendChild(cardElement);
      });

      const statusButtons = d.querySelectorAll(".btn-status");
      statusButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          const participanteId = button.getAttribute("data-id");
          const currentStatus = JSON.parse(button.getAttribute("data-status"));
          cambiarEstadoParticipante(participanteId, currentStatus);
        });
      });

      const editButtons = d.querySelectorAll(".btn-details");
      editButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const participanteId = button.getAttribute("data-id");
          localStorage.setItem("participanteId", participanteId);
          window.location.href = "actPart.html";
        });
      });
    } catch (error) {
      console.error("Error al cargar los participantes:", error);
      Swal.fire(
        "Error",
        "Hubo un problema al cargar los participantes.",
        "error"
      );
    }
  };

  
    if(w.location.href.includes("verPart.html")){
      cargarParticipantes();
    }
  

  function cambiarEstadoParticipante(participanteId, estadoActual) {
    const token = localStorage.getItem("authToken");
    const nuevoEstado = !estadoActual;

    fetch(ruta + "participantes/change-status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: participanteId,
        status: nuevoEstado,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cambiar el estado del participante");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Estado del participante actualizado:", data);
        w.location.reload();

        const botonEstado = document.getElementById(
          `btn-status-${participanteId}`
        );
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
          title: "Éxito",
          text: "El estado del participante se actualizó correctamente.",
        });
      })
      .catch((error) => {
        console.error("Error al cambiar el estado:", error);

        Swal.fire({
          icon: "error",
          title: "Error al cambiar el estado",
          text: "Ocurrió un problema al cambiar el estado del participante. Por favor, intenta de nuevo.",
          confirmButtonText: "Reintentar",
        });
      });
  }

  async function cargarParticipanteEnFormulario(formularioId) {
    const participanteId = localStorage.getItem("participanteId");
    const token = localStorage.getItem("authToken");

    if (!participanteId) {
      w.location.href = "verPart.html";
    }
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const $formActualizar = document.getElementById(
      "actualizarParticipanteForm"
    );

    try {
      const response = await fetch(`${ruta}participantes/${participanteId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los datos del participante.");
      }

      const data = await response.json();
      const participante = data.result;
      console.log(participante);

      $formActualizar["usuario-Update"].value = participante.nombre;
      $formActualizar["usuario-ape-Update"].value = participante.apellido;
      $formActualizar["usuario-tel-Update"].value = participante.telefono;
      $formActualizar["usuario-email-Update"].value =
        participante.correoElectronico;
      $formActualizar["usuario-direccion-Update"].value =
        participante.direccion;
    } catch (error) {
      console.error("Error al cargar el participante:", error);
      Swal.fire(
        "Error",
        "Hubo un problema al cargar los datos del participante.",
        "error"
      ).then(() => {
        localStorage.removeItem("participanteId");
        window.location.href = "verPart.html";
      });
    }
  }

  if (w.location.href.includes("actPart.html")) {
    cargarParticipanteEnFormulario();
  }

  const participanteId = localStorage.getItem("participanteId");

  const $formActualizar = document.getElementById("actualizarParticipanteForm");

  if ($formActualizar) {
    $formActualizar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const participante = {
        id: parseInt(localStorage.getItem("participanteId")),
        nombre: document.getElementById("inputNombreUpdate").value.trim(),
        apellido: document.getElementById("inputApellidosUpdate").value.trim(),
        telefono: parseInt(
          document.getElementById("inputTelefonoUpdate").value.trim(),
          10
        ),
        correoElectronico: document
          .getElementById("inputCorreoUpdate")
          .value.trim(),
        direccion: document.getElementById("inputDireccionUpdate").value.trim(),
      };
      console.log(participante);
      try {
        if (!participante.nombre || participante.nombre.length > 50) {
          throw new Error(
            "El nombre es obligatorio y no debe exceder los 50 caracteres."
          );
        }
        if (!participante.apellido || participante.apellido.length > 80) {
          throw new Error(
            "Los apellidos son obligatorios y no deben exceder los 80 caracteres."
          );
        }
        if (
          !participante.telefono ||
          participante.telefono.toString().length !== 10
        ) {
          throw new Error("El teléfono debe tener exactamente 10 dígitos.");
        }
        if (
          !participante.correoElectronico ||
          participante.correoElectronico.length > 74
        ) {
          throw new Error(
            "El correo electrónico es obligatorio y no debe exceder los 74 caracteres."
          );
        }
        if (!participante.direccion || participante.direccion.length > 250) {
          throw new Error(
            "La dirección es obligatoria y no debe exceder los 250 caracteres."
          );
        }

        const response = await fetch(`${ruta}participantes/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(participante),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar los datos del participante.");
        }

        const result = await response.json();
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: result.message || "Participante actualizado exitosamente.",
        }).then(() => {
          localStorage.removeItem("participanteId");
          window.location.href = "verPart.html";
        });
      } catch (error) {
        console.error("Error al actualizar el participante:", error);
        Swal.fire(
          "Error",
          error.message ||
            "Hubo un problema al actualizar los datos del participante.",
          "error"
        );
      }
    });
  }
});
