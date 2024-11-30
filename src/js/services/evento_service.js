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
              <button class="btn-edit-event btn-editar" >
        <a href="actEvento.html" class="edit-link " data-event-id="${event.id}">Editar</a>
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

    const editButtons = d.querySelectorAll(".btn-edit-event a");
    editButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        const eventId = button.getAttribute("data-event-id");
        localStorage.setItem("eventoId", eventId); // Guardamos el ID del evento
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


  // Función que carga los datos del evento en el formulario
function cargarInfoEvento() {
    const eventoId = localStorage.getItem('eventoId');  // Recuperamos el ID del evento
    if (eventoId) {
      console.log(`Recuperado id de evento: ${eventoId}`);
  
      // Realizamos una solicitud GET para obtener los detalles del evento
      const token = localStorage.getItem("authToken");
      if (!token) {
        w.location.href = "login.html";
        return;
      }
  
      fetch(ruta + "eventos/" + eventoId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        // Llenamos el formulario con los datos del evento
        document.getElementById('eventNameUpdate').value = data.result.nombre;
        document.getElementById('eventDesUpdate').value = data.result.descripcion;
        document.getElementById('eventAddressUpdate').value = data.result.lugar;
        document.getElementById('eventDateUpdate').value = data.result.fecha;
        document.getElementById('eventTimeUpdate').value = data.result.hora;
        document.getElementById('eventStatusUpdate').value = data.result.status ? 'true' : 'false';
        
        // Llenar el campo de categorías si es necesario
        cargarCategorias();  // Asumo que tienes esta función para cargar las categorías
      })
      .catch(error => {
        console.error('Error al obtener los datos del evento:', error);
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha encontrado el ID del evento.",
      });
      w.location.href = "buscarEventosAdmin.html";  // Redirigir si no hay ID de evento
    }
  }
  
  // Función para cargar las categorías activas (puedes adaptarla si ya tienes esta función)
  function cargarCategorias() {
    const token = localStorage.getItem("authToken");
    const categorySelect = d.getElementById('categorySelectUpdate');
  
    fetch(ruta + "categorias/all-active", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.json())
    .then(data => {
      data.result.forEach(cat => {
        const option = d.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        categorySelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Error al cargar las categorías:", error);
    });
  }
  
  // Función que se ejecuta cuando se envía el formulario
  function actualizarEvento(event) {
    event.preventDefault();  // Prevenir el comportamiento por defecto del formulario
  
    const eventoId = localStorage.getItem('eventoId');  // Recuperamos el ID del evento desde localStorage
    if (!eventoId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha encontrado el ID del evento.",
      });
      return;
    }
  
    // Obtenemos los valores del formulario
    const nombre = document.getElementById('eventNameUpdate').value.trim();
    const descripcion = document.getElementById('eventDesUpdate').value.trim();
    const direccion = document.getElementById('eventAddressUpdate').value.trim();
    const fecha = document.getElementById('eventDateUpdate').value.trim();
    const hora = document.getElementById('eventTimeUpdate').value.trim();
    const categoriaId = document.getElementById('categorySelectUpdate').value.trim();
    const status = document.getElementById('eventStatusUpdate').value === 'true';
  
    // Verificamos que todos los campos estén completos
    if (!nombre || !descripcion || !fecha || !hora || !direccion || !categoriaId) {
      Swal.fire({
        icon: "error",
        title: "Campos vacíos",
        text: "Por favor, completa todos los campos.",
      });
      return;
    }
  
    // Creamos el objeto con los datos actualizados
    const evento = {
      id: eventoId,
      nombre: nombre,
      descripcion: descripcion,
      fecha: fecha,
      hora: hora,
      lugar: direccion,
      categoriaId: parseInt(categoriaId),  // Convertimos el ID de la categoría a número
      status: status,
    };
  
    // Obtenemos el token de autenticación
    const token = localStorage.getItem("authToken");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "No autorizado",
        text: "No tienes permisos para actualizar el evento.",
      });
      return;
    }
  
    // Realizamos la solicitud PUT para actualizar el evento
    fetch(ruta + "eventos/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(evento),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("Error al actualizar el evento");
      }
      return res.json();
    })
    .then(data => {
        Swal.fire({
            icon: "success",
            title: "Evento actualizado",
            text: "El evento ha sido actualizado correctamente.",
            confirmButtonText: "Aceptar",
            customClass: {
                title: "text-center", // Centra el título
                content: "text-center", // Centra el contenido
                confirmButton: "btn-center" // Centra el botón
            }
        }).then(() => {
        w.location.href = "buscarEventosAdmin.html";  // Redirigimos al listado de eventos
      });
    })
    .catch(error => {
      console.error("Error al actualizar el evento:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "Hubo un problema al actualizar el evento. Inténtalo nuevamente.",
      });
    });
  }
  
  // Cargar los datos del evento cuando se cargue la página
  
    cargarInfoEvento();  // Llamamos para cargar los datos del evento
  
    // Asignar el evento al formulario
    const formActualizar = d.getElementById('updateEventForm');
    if (formActualizar) {
        formActualizar.addEventListener("submit", actualizarEvento);
    }
  


});
