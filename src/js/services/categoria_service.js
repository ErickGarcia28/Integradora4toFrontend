import { d, ruta } from '../constantes.js';

const token = localStorage.getItem("authToken");

d.addEventListener("DOMContentLoaded", () => {
    const form = d.getElementById("loginForm");

    if(form){
        form.addEventListener("submit", (event) => {
            event.preventDefault();
    
            const $nombreCategoria = d.getElementById("nombreCategoriaInput").value.trim();
            const $descripcionCategoria = d.getElementById("descripcionCategoriaInput").value.trim();
    
            if (!$nombreCategoria || !$descripcionCategoria) {
                Swal.fire({
                    icon: "error",
                    title: "Campos vacíos",
                    text: "Por favor, ingresa tanto el nombre como la descripción de la categoría.",
                    confirmButtonText: "Aceptar"
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
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(categoria),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al crear la categoría");
                }
                return response.json();
            })
            .then(data => {
                console.log("Categoría creada con éxito:", data);
    
             
                Swal.fire({
                    icon: "success",
                    title: "Categoría creada",
                    text: "La categoría ha sido creada correctamente.",
                    confirmButtonText: "Aceptar",
                }).then(() => {
                    form.reset(); 
                });
            })
            .catch(error => {
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


        const $cards_container = d.getElementById("cards-container")

        // Ver categorías
        fetch(ruta + "categorias/all", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Error al obtener las categorías');
            }
            return res.json();
        })
        .then(data => {
            console.log(data.result)
            data.result.forEach(cat => {
                let $card  = d.createElement("card");
                $card.classList.add("card")
                $card.innerHTML =  ` 
                <div class="card-content">
                    <h3>${cat.nombre}</h3>
                    <p>${cat.descripcion}</p>
                    <p><strong>Estado:</strong> ${cat.status ? "Activa" : "Deshabilitada"}</p>
                </div>
                <div class="more-info">
                    <button id="btn-status-${cat.id}" class="btn-status ${cat.status ? "btn-red": "btn-green"} ">
                        ${cat.status ? 'DESHABILITAR' : 'ACTIVAR'}
                    </button>
                    <button class="btn-details"><a href="actCategoria.html">EDITAR</a></button>
                </div>
            `;

            const btnStatus = $card.querySelector(`#btn-status-${cat.id}`);
            btnStatus.addEventListener("click", () => cambiarEstado(cat.id, cat.status));            

            $cards_container.appendChild($card);
            });

        })
        .catch( error => {
            console.error('Error:', error);
        });

     
        function cambiarEstado(categoriaId, estadoActual) {
            const token = localStorage.getItem("authToken");
            
            const nuevoEstado = !estadoActual;
        
            

            fetch(ruta + "categorias/change-status", {
                method: "PUT",  
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: categoriaId, 
                    status: nuevoEstado  
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cambiar el estado de la categoría');
                }
                return response.json();
            })
            .then(data => {
                console.log("Estado de la categoría actualizado:", data);
        
                const botonEstado = document.getElementById(`btn-status-${categoriaId}`);
                if (nuevoEstado) {
                    botonEstado.innerHTML = 'DESHABILITAR';
                    botonEstado.classList.add("btn-red")
                } else {
                    botonEstado.innerHTML = 'ACTIVAR';
                    botonEstado.classList.add("btn-green")
                }
         
                window.location.reload();
                
                // Swal.fire({
                //     icon: "success",
                //     title: "Estado de Categoría",
                //     text: "El estado de la categoría actualizado",
                //     confirmButtonText: "Aceptar",
                // }).then(() => {
                //     window.location.reload();  
                // });
                
            })
            .catch(error => {
                console.error('Error al cambiar el estado:', error);
        
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cambiar el estado',
                    text: 'Ocurrió un problema al cambiar el estado de la categoría. Por favor, intenta de nuevo.',
                    confirmButtonText: 'Reintentar'
                });
            });
        }
});
