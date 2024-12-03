import { d, ruta, w } from "../constantes.js";

d.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    w.location.href = "login.html";
  }
  const form = d.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const $nombreCategoria = d
        .getElementById("nombreCategoriaInput")
        .value.trim();
      const $descripcionCategoria = d
        .getElementById("descripcionCategoriaInput")
        .value.trim();

      if (!$nombreCategoria || !$descripcionCategoria) {
        Swal.fire({
          icon: "error",
          title: "Campos vacíos",
          text: "Por favor, ingresa tanto el nombre como la descripción de la categoría.",
          confirmButtonText: "Aceptar",
        });
        return;
      }
      const categoria = {
        nombre: $nombreCategoria,
        descripcion: $descripcionCategoria,
      };

      console.log(categoria);

      fetch(ruta + "categorias/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoria),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al crear la categoría");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Categoría creada con éxito:", data);

          Swal.fire({
            icon: "success",
            title: "Categoría creada",
            text: "La categoría ha sido creada correctamente.",
            confirmButtonText: "Aceptar",
          }).then(() => {
            form.reset();
            window.location.href = "verCat.html";
          });
        })
        .catch((error) => {
          console.error("Error en la petición:", error);

          Swal.fire({
            icon: "error",
            title: "Error al crear la categoría",
            text: "Ocurrió un problema al crear la categoría. Verifica los datos e inténtalo nuevamente.",
            confirmButtonText: "Reintentar",
          });
        });
    });
  }

  const $cards_container = d.getElementById("cards-container");

  // Ver categorías
  fetch(ruta + "categorias/all", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error al obtener las categorías");
      }
      return res.json();
    })
    .then((data) => {
      console.log(data.result);
      data.result.forEach((cat) => {
        let $card = d.createElement("card");
        $card.classList.add("card");
        $card.innerHTML = `
                    <div class="card-content">
                        <h3>${cat.nombre}</h3>
                        <p>${cat.descripcion}</p>
                        <p><strong>Estado:</strong> ${
                          cat.status ? "Activa" : "Deshabilitada"
                        }</p>
                    </div>
                    <div class="more-info">
                        <button id="btn-status-${cat.id}" class="btn-status ${
          cat.status ? "btn-red" : "btn-green"
        } ">
                            ${cat.status ? "DESHABILITAR" : "ACTIVAR"}
                        </button>
                        <button class="btn-details"><a href="actCategoria.html">EDITAR</a></button>
                    </div>
                `;

        const btnStatus = $card.querySelector(`#btn-status-${cat.id}`);
        const btnDetails = $card.querySelector(".btn-details");

        btnStatus.addEventListener("click", () =>
          cambiarEstado(cat.id, cat.status)
        );

        btnDetails.addEventListener("click", () => {
          localStorage.setItem("categoryId", cat.id);
          console.log(`Categoría con id ${cat.id} guardada en localStorage.`);
        });

        if ($cards_container) {
          $cards_container.appendChild($card);
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });




function obtenerCategoriasActivas() {

  fetch(ruta + "categorias/all-active", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error al obtener las categorías");
      }
      return res.json();
    })
    .then((data) => {
      console.log(data.result);

      const $cards_container = document.getElementById("cards-container");
      if ($cards_container) {
        $cards_container.innerHTML = ""; 
      }

      data.result.forEach((cat) => {
        let $card = document.createElement("div"); 
        $card.classList.add("card");
        $card.innerHTML = `
          <div class="card-content">
            <h3>${cat.nombre}</h3>
            <p>${cat.descripcion}</p>
            <p><strong>Estado:</strong> ${cat.status ? "Activa" : "Deshabilitada"}</p>
          </div>
          <div class="more-info">
            <button id="btn-status-${cat.id}" class="btn-status ${cat.status ? "btn-red" : "btn-green"}">
              ${cat.status ? "DESHABILITAR" : "ACTIVAR"}
            </button>
            <button class="btn-details"><a href="actCategoria.html">EDITAR</a></button>
          </div>
        `;

        const btnStatus = $card.querySelector(`#btn-status-${cat.id}`);
        const btnDetails = $card.querySelector(".btn-details");

        btnStatus.addEventListener("click", () => cambiarEstado(cat.id, cat.status));

        btnDetails.addEventListener("click", () => {
          localStorage.setItem("categoryId", cat.id);
          console.log(`Categoría con id ${cat.id} guardada en localStorage.`);
        });

        if ($cards_container) {
          $cards_container.appendChild($card);
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}


  const btnCatActive = document.getElementById("btncat-active");

  if (btnCatActive) {
    btnCatActive.addEventListener("click", (e) => {
      e.preventDefault();
      obtenerCategoriasActivas(); 
    });
  }

  const btnReload = d.getElementById("btn-reload");
  if(btnReload){
    btnReload.addEventListener("click",()=>{
      w.location.reload();
    });
  }






  function cambiarEstado(categoriaId, estadoActual) {
    const token = localStorage.getItem("authToken");

    const nuevoEstado = !estadoActual;

    fetch(ruta + "categorias/change-status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: categoriaId,
        status: nuevoEstado,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cambiar el estado de la categoría");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Estado de la categoría actualizado:", data);

        const botonEstado = document.getElementById(
          `btn-status-${categoriaId}`
        );
        if (nuevoEstado) {
          botonEstado.innerHTML = "DESHABILITAR";
          botonEstado.classList.add("btn-red");
        } else {
          botonEstado.innerHTML = "ACTIVAR";
          botonEstado.classList.add("btn-green");
        }

        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          text: "El estado del participante ha sido actualizado",
          confirmButtonText: "Aceptar",
        }).then(() => {
            w.location.reload();
        });
        
      })
      .catch((error) => {
        console.error("Error al cambiar el estado:", error);

        Swal.fire({
          icon: "error",
          title: "Error al cambiar el estado",
          text: "Ocurrió un problema al cambiar el estado de la categoría. Por favor, intenta de nuevo.",
          confirmButtonText: "Reintentar",
        });
      });
  }

  function cargarInfoCategoria() {
    const categoryId = localStorage.getItem("categoryId");
    if (categoryId) {
      console.log(`Recuperado id de categoría: ${categoryId}`);
      fetch(ruta + "categorias/" + categoryId, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          document.getElementById("nombreCategoriaInputUpdate").value =
            data.result.nombre;
          document.getElementById("descripcionCategoriaInputUpdate").value =
            data.result.descripcion;
        })
        .catch((error) => {
          console.error("Error al obtener los datos de la categoría:", error);
        });
    } else {
      console.error("No se encontró el id de la categoría en localStorage.");
    }
  }

  if(w.location.href.includes("actCategoria.html")){
    cargarInfoCategoria();
  }

  const $btnActualizar = d.getElementById("actualizar-cat-btn");
  if($btnActualizar){
    $btnActualizar.addEventListener("click", actualizarCategoria);
  }

  function actualizarCategoria() {
    const nombreCategoria = d
      .getElementById("nombreCategoriaInputUpdate")
      .value.trim();
    const descripcionCategoria = d
      .getElementById("descripcionCategoriaInputUpdate")
      .value.trim();

    if (!nombreCategoria || !descripcionCategoria) {
      Swal.fire({
        icon: "error",
        title: "Campos vacíos",
        text: "Por favor, ingresa tanto el nombre como la descripción de la categoría.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const categoryId = localStorage.getItem("categoryId");
    if (!categoryId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha encontrado el ID de la categoría.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const categoria = {
      id: categoryId,
      nombre: nombreCategoria,
      descripcion: descripcionCategoria,
    };

    const token = localStorage.getItem("authToken");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se ha encontrado el token de autorización.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    fetch(ruta + "categorias/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoria),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al actualizar la categoría");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Categoría actualizada con éxito:", data);

        Swal.fire({
          icon: "success",
          title: "Categoría actualizada",
          text: "La categoría ha sido actualizada correctamente.",
          confirmButtonText: "Aceptar",
        }).then(() => {
          window.location.href = "verCat.html";
        });
      })
      .catch((error) => {
        console.error("Error en la petición:", error);

        Swal.fire({
          icon: "error",
          title: "Error al actualizar la categoría",
          text: "Ocurrió un problema al actualizar la categoría. Intenta nuevamente.",
          confirmButtonText: "Reintentar",
        });
      });
  }
});
