import { d, ruta, w, c } from "../constantes.js";

d.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    w.location.href = "login.html";
  }

  const form = d.getElementById("createEventForm");
  const categorySelect = d.getElementById("categorySelect");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const eventName = d.getElementById("eventName").value;
      const eventDesc = d.getElementById("eventDes").value;
      const eventDate = d.getElementById("eventDate").value;
      const eventTime = d.getElementById("eventTime").value;
      const eventAddress = d.getElementById("eventAddress").value;
      const eventCat = d.getElementById("categorySelect").value;

      if (
        !eventName ||
        !eventDesc ||
        !eventDate ||
        !eventTime ||
        !eventAddress ||
        !eventCat
      ) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: "Por favor, completa todos los campos.",
        });
        return;
      }

      const eventData = {
        nombre: eventName,
        descripcion: eventDesc,
        fecha: eventDate,
        hora: eventTime,
        lugar: eventAddress, // Lugar
        categoriaId: parseInt(eventCat), // Convertir a número entero
        status: true, // Agregar el campo status
      };

      console.log(eventData);

      fetch(ruta + "eventos/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error al registrar el evento");
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
          if (data.type === "SUCCESS") {
            Swal.fire({
              icon: "success",
              title: "¡Éxito!",
              text: "Evento registrado con éxito.",
              confirmButtonText: "Aceptar",
              customClass: {
                title: "text-center",
                content: "text-center",
              },
            }).then(() => {
            form.reset(); 
              w.location.href = "buscarEventosAdmin.html";
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "¡Error!",
              text: data.message || "Hubo un error al registrar el evento.",
            });
          }
        })
        .catch((error) => {
          console.error("Error al registrar el evento:", error);
          Swal.fire({
            icon: "error",
            title: "¡Error!",
            text: "Hubo un error. Inténtalo nuevamente.",
          });
        });
    });
  }

  if (categorySelect) {
    fetch(ruta + "categorias/all-active", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al obtener las categorías activas");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        data.result.forEach((cat) => {
          const option = d.createElement("option");
          option.value = cat.id;
          option.textContent = cat.nombre;
          categorySelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error al cargar los eventos:", error);
      });
  }

    // CARGA DE EVENTOS
  // Función para cargar todos los eventos
  const loadEvents = () => {
    fetch(ruta + "eventos/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al obtener los eventos");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.result && data.result.length > 0) {
          // Llamar a la función para mostrar los eventos
          displayEvents(data.result);
        } else {
          console.log("No se encontraron eventos.");
          // Aquí podrías mostrar un mensaje si no hay eventos
        }
      })
      .catch((error) => {
        console.error("Error al cargar los eventos:", error);
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: "Hubo un problema al cargar los eventos.",
        });
      });
  };

  const displayEvents = (events) => {
    const cardsContainer = d.querySelector(".cards-container");
    cardsContainer.innerHTML = ""; // Limpiar cualquier tarjeta existente
  
    events.forEach((event) => {
      // Definir el texto del botón dependiendo del estado actual del evento
      const statusButtonText = event.status ? "Desactivar" : "Activar";
  
      const cardHTML = `
        <div class="card" data-event-id="${event.id}">
          <div class="card-content">
            <h3>${event.nombre}</h3>
            <p><b>Fecha</b>: ${new Date(event.fecha).toLocaleDateString()}</p>
            <p><b>Hora</b>: ${event.hora}</p>
            <p><b>Lugar</b>: ${event.lugar}</p>
          </div>
          <div class="more-info">
            <button class="btn-details">
              <a href="detallesEventoAdmin.html">Detalles</a>
            </button>
            <!-- Botón de cambio de estado -->
            <button class="btn-toggle-status btn-status ${event.status ? 'btn-red' : 'btn-green'}" data-event-id="${event.id}" data-status="${event.status}">
              ${statusButtonText}
            </button>
          </div>
        </div>
      `;
      cardsContainer.innerHTML += cardHTML; // Agregar la tarjeta al contenedor
    });
  
    // Agregar el evento de click para el botón de cambio de estado
    const statusButtons = d.querySelectorAll(".btn-toggle-status");
    statusButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const eventId = e.target.getAttribute("data-event-id");
        const currentStatus = JSON.parse(e.target.getAttribute("data-status"));
        cambiarEstadoUsuario(eventId, currentStatus);  // Llamar a la función para cambiar el estado
      });
    });
  };
  
  if(w.location.href.includes("buscarEventosAdmin.html")){
    loadEvents();
  }

  const cambiarEstadoUsuario = (eventId, currentStatus) => {

    // Cambiar el estado: si está activo (true), lo ponemos a inactivo (false), y viceversa
    const newStatus = !currentStatus;
  
    // Crear el cuerpo de la solicitud con los datos del evento
    const eventData = {
      id: parseInt(eventId),
      status: newStatus,  // Cambiar el estado
    };
    console.log(eventData);
    // Enviar la solicitud PUT para actualizar el estado del evento
    fetch(ruta + "eventos/change-status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al actualizar el estado del evento");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.type === "SUCCESS") {
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: `El evento ha sido ${newStatus ? "activado" : "desactivado"}.`,
          });
  
          // Recargar los eventos para reflejar el cambio de estado
          loadEvents();
        } else {
          Swal.fire({
            icon: "error",
            title: "¡Error!",
            text: data.message || "Hubo un problema al actualizar el estado.",
          });
        }
      })
      .catch((error) => {
        console.error("Error al actualizar el estado del evento:", error);
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: "Hubo un problema al cambiar el estado del evento.",
        });
      });
  };
  
  
});
