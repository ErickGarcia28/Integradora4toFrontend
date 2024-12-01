import { d, ruta, w, c } from "../constantes.js";

d.addEventListener("DOMContentLoaded",()=>{
    const token = localStorage.getItem("authToken");

    if (!token) {
      w.location.href = "login.html";
    }
    
    const cardsContainer = document.querySelector(".cards-container");
    const cargarEventosOrdenados = () => {
      fetch(ruta + "eventos/all-ordered")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error al obtener los eventos ordenados por fecha");
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
    
          cardsContainer.innerHTML = ""; // Limpiar las tarjetas existentes
    
          data.result.forEach((event) => {
            // Crear el HTML para cada tarjeta de evento
            const cardHTML = `
              <div class="card">
                <div class="card-content">
                  <h3>${event.nombre}</h3>
                  <p><b>Fecha</b>: ${new Date(event.fecha).toLocaleDateString()} ${event.hora}</p>
                  <p><b>Lugar</b>: ${event.lugar}</p>
                </div>
                <div class="more-info">
                  <button class="btn-details">DETALLES</button>
                </div>
              </div>
            `;
    
            // Crear un contenedor de la tarjeta y añadirlo al contenedor de tarjetas
            const cardElement = document.createElement("div");
            cardElement.innerHTML = cardHTML; // Asignar el HTML de la tarjeta
            cardsContainer.appendChild(cardElement); // Agregar la tarjeta al contenedor
    
            // Agregar evento de click al botón "DETALLES"
            const detailsButton = cardElement.querySelector(".btn-details");
            detailsButton.addEventListener("click", () => {
              // Guardar el ID del evento en el localStorage
              localStorage.setItem("eventoDetalles", event.id);
              // Redirigir a la página de detalles
              window.location.href = "detallesEvento.html";
            });
          });
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
    
    if(cardsContainer){
        cargarEventosOrdenados();
    }
    
    
    const eventoId = localStorage.getItem("eventoDetalles");
    
    if (eventoId && (w.location.href.includes("detallesEvento.html") || w.location.href.includes("detallesEventoAdmin.html"))) {
        // Hacer la petición para obtener los detalles del evento
        fetch(ruta + "eventos/" + eventoId, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((event) => {
                console.log(event);
                event = event.result;
                if (event) {
                    // Actualizar los elementos en la página con los detalles del evento
                    document.querySelector("#event-name").textContent = event.nombre;
                    document.querySelector("#event-date").textContent = `Fecha: ${new Date(event.fecha).toLocaleDateString()}`;
                    document.querySelector("#event-hour").textContent = `Hora:  ${event.hora}`;
                    document.querySelector("#event-location").textContent = `Lugar: ${event.lugar}`;
                    document.querySelector("#event-category").textContent = `Categoría: ${event.categoria.nombre || 'No disponible'}`;
                    document.querySelector("#event-description").textContent = event.descripcion || 'Descripción no disponible';
                    // Actualizar la imagen si hay una asociada al evento
                    const eventImage = document.querySelector("#event-image");
                    // eventImage.src = event.imagen || "../../../img/default.jpg";
                    // eventImage.alt = `Imagen de ${event.nombre}`;
                }
            })
            .catch((error) => {
                console.error("Error al cargar los detalles del evento:", error);
                Swal.fire({
                    icon: "error",
                    title: "¡Error!",
                    text: "Hubo un problema al cargar los detalles del evento.",
                });
            });
    } else {
        console.log("No se encontró el ID del evento en el almacenamiento.");
    }


    

});