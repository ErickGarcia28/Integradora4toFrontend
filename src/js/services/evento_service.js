import { d, ruta, w, c } from "../constantes.js";




function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = decodeURIComponent(
    atob(base64Url)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(base64);
}

d.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const usuarioId = localStorage.getItem("usuarioId");

  console.log("Usuario id " + usuarioId);

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

      if (!usuarioId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontró el ID del usuario. Por favor, inicia sesión nuevamente.",
        });
        return; // Detener la ejecución si no se encuentra el usuario
      }

      const eventData = {
        nombre: eventName,
        descripcion: eventDesc,
        fecha: eventDate,
        hora: eventTime,
        lugar: eventAddress,
        categoriaId: parseInt(eventCat),
        status: true,
        usuarioId: parseInt(usuarioId)
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
          console.log("evento creado");
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
  const btnReload = d.getElementById("btn-reload");
  if(btnReload){
    btnReload.addEventListener("click",()=>{
      w.location.reload();
    });
  }
  
  const btnCatActive = d.getElementById("btn-events-active");
  if (btnCatActive) {
    btnCatActive.addEventListener("click", (e) => {
      e.preventDefault();
      loadActiveEvents(); 
    });
  }

  const loadEvents = () => {
    fetch(ruta + "eventos/all-by-user-id/" + usuarioId, {
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
          displayEvents(data.result);
        } else {
          console.log("No se encontraron eventos.");
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

  const loadActiveEvents = () => {
    fetch(ruta + "eventos/all-by-user-id-active/" + usuarioId, {
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
          displayEvents(data.result);
        } else {
          console.log("No se encontraron eventos.");
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


  if (w.location.href.includes("buscarEventosAdmin.html")) {
    loadEvents();
  }
  const btnActives = d.getElementById("btn-events-active");

  if (btnActives) {
    btnActives.addEventListener("click",(e)=>{
      e.preventDefault();
      loadActiveEvents();
    });
  }


  const displayEvents = (events) => {
    const cardsContainer = d.querySelector(".cards-container");
    cardsContainer.innerHTML = "";

    events.forEach((event) => {
      const statusButtonText = event.status ? "Desactivar" : "Activar";

      const cardHTML = `
        <div class="card" data-event-id="${event.id}">
          <div class="card-content">
            <h3>${event.nombre}</h3>
            <p><b>Fecha</b>: ${event.fecha}</p>
            <p><b>Hora</b>: ${event.hora}</p>
            <p><b>Lugar</b>: ${event.lugar}</p>
          </div>
          <div class="more-info">
            <button class="btn-details">
              <a href="detallesEventoAdmin.html">Detalles</a>
            </button>
              <button class="btn-edit-event btn-editar" >
        <a href="actEvento.html" class="edit-link " data-event-id="${
          event.id
        }">Editar</a>
      </button>
            <!-- Botón de cambio de estado -->
            <button class="btn-toggle-status btn-status ${
              event.status ? "btn-red" : "btn-green"
            }" data-event-id="${event.id}" data-status="${event.status}">
              ${statusButtonText}
            </button>
          </div>
        </div>
      `;
      cardsContainer.innerHTML += cardHTML;
    });

    const statusButtons = d.querySelectorAll(".btn-toggle-status");
    statusButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const eventId = e.target.getAttribute("data-event-id");
        const currentStatus = JSON.parse(e.target.getAttribute("data-status"));
        cambiarEstadoUsuario(eventId, currentStatus);
      });
    });

    const editButtons = d.querySelectorAll(".btn-edit-event a");
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const eventId = button.getAttribute("data-event-id");
        localStorage.setItem("eventoId", eventId);
        localStorage.setItem("eventoDetalles", eventId);
      });
    });

    const detallesButtons = d.querySelectorAll(".btn-details");
    detallesButtons.forEach((detalleBtn) => {
      detalleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const eventId = detalleBtn
          .closest(".card")
          .getAttribute("data-event-id");
        localStorage.setItem("eventoId", eventId);
        localStorage.setItem("eventoDetalles", eventId);
        window.location.href = "detallesEventoAdmin.html";
      });
    });
  };


  const cambiarEstadoUsuario = (eventId, currentStatus) => {
    const newStatus = !currentStatus;

    const eventData = {
      id: parseInt(eventId),
      status: newStatus,
    };
    console.log(eventData);

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
            title: "Estado del evento actualizado",
            text: `El evento ha sido ${
              newStatus ? "activado" : "desactivado"
            }.`,
          });
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

  function cargarInfoEvento() {
    const eventoId = localStorage.getItem("eventoId");
    if (eventoId) {
      console.log(`Recuperado id de evento: ${eventoId}`);

      const token = localStorage.getItem("authToken");
      if (!token) {
        w.location.href = "login.html";
        return;
      }

      fetch(ruta + "eventos/" + eventoId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          document.getElementById("eventNameUpdate").value = data.result.nombre;
          document.getElementById("eventDesUpdate").value =
            data.result.descripcion;
          document.getElementById("eventAddressUpdate").value =
            data.result.lugar;
          document.getElementById("eventDateUpdate").value = data.result.fecha;
          document.getElementById("eventTimeUpdate").value = data.result.hora;
          document.getElementById("eventStatusUpdate").value = data.result
            .status
            ? "true"
            : "false";

          cargarCategorias();
        })
        .catch((error) => {
          console.error("Error al obtener los datos del evento:", error);
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha encontrado el ID del evento.",
      });
      w.location.href = "buscarEventosAdmin.html";
    }
  }

  function cargarCategorias() {
    const token = localStorage.getItem("authToken");
    const categorySelect = d.getElementById("categorySelectUpdate");

    fetch(ruta + "categorias/all-active", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        data.result.forEach((cat) => {
          const option = d.createElement("option");
          option.value = cat.id;
          option.textContent = cat.nombre;
          categorySelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error al cargar las categorías:", error);
      });
  }

  function actualizarEvento(event) {
    event.preventDefault();

    const eventoId = localStorage.getItem("eventoId");
    if (!eventoId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha encontrado el ID del evento.",
      });
      return;
    }

    const nombre = document.getElementById("eventNameUpdate").value.trim();
    const descripcion = document.getElementById("eventDesUpdate").value.trim();
    const direccion = document
      .getElementById("eventAddressUpdate")
      .value.trim();
    const fecha = document.getElementById("eventDateUpdate").value.trim();
    const hora = document.getElementById("eventTimeUpdate").value.trim();
    const categoriaId = document
      .getElementById("categorySelectUpdate")
      .value.trim();
    const status =
      document.getElementById("eventStatusUpdate").value === "true";

    if (
      !nombre ||
      !descripcion ||
      !fecha ||
      !hora ||
      !direccion ||
      !categoriaId
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos vacíos",
        text: "Por favor, completa todos los campos.",
      });
      return;
    }

    const evento = {
      id: eventoId,
      nombre: nombre,
      descripcion: descripcion,
      fecha: fecha,
      hora: hora,
      lugar: direccion,
      categoriaId: parseInt(categoriaId),
      status: status,
      usuarioId: usuarioId
    };

    const token = localStorage.getItem("authToken");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "No autorizado",
        text: "No tienes permisos para actualizar el evento.",
      });
      return;
    }

    fetch(ruta + "eventos/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(evento),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al actualizar el evento");
        }
        return res.json();
      })
      .then((data) => {
        Swal.fire({
          icon: "success",
          title: "Evento actualizado",
          text: "El evento ha sido actualizado correctamente.",
          confirmButtonText: "Aceptar",
          customClass: {
            title: "text-center",
            content: "text-center",
            confirmButton: "btn-center",
          },
        }).then(() => {
          w.location.href = "buscarEventosAdmin.html";
        });
      })
      .catch((error) => {
        console.error("Error al actualizar el evento:", error);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: "Hubo un problema al actualizar el evento. Inténtalo nuevamente.",
        });
      });
  }

  if(w.location.href.includes("actEvento.html")){
    cargarInfoEvento();
  }

  const formActualizar = d.getElementById("updateEventForm");
  if (formActualizar) {
    formActualizar.addEventListener("submit", actualizarEvento);
  }
});
