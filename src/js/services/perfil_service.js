import { d, ruta, w } from "../constantes.js";

d.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const usuarioId = localStorage.getItem("usuarioId");

  if (!token) {
    w.location.href = "login.html"; // Redirige al login si no hay token
    return;
  }

  if (!usuarioId) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se encontró el ID del usuario en el almacenamiento local.",
    });
    return;
  }

  const inputNombre = d.getElementById("inputNombre");
  const inputApellido = d.getElementById("inputApellido");
  const inputEmail = d.getElementById("inputEmail");
  const inputTelefono = d.getElementById("inputTelefono");
  const editProfileButton = d.getElementById("editProfileButton");
  const saveProfileButton = d.getElementById("saveProfileButton");

  // Cargar información del perfil
  const cargarPerfil = async () => {
    try {
      console.log(`Recuperado id de usuario: ${usuarioId}`);
      const response = await fetch(`${ruta}usuarios/${usuarioId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar la información del usuario.");
      }

      const data = await response.json();
      const usuario = data.result; // Ajusta según la estructura de tu backend
      console.log(usuario);
      // Llenar los inputs con la información del usuario
      inputNombre.value = usuario.nombre;
      inputApellido.value = usuario.apellido;
      inputEmail.value = usuario.correoElectronico;
      inputTelefono.value = usuario.telefono;

      console.log("Datos del usuario cargados:", usuario);
    } catch (error) {
      console.error("Error al cargar el perfil del usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al cargar la información del usuario.",
      });
    }
  };

  // Habilitar edición del perfil
  const habilitarEdicion = () => {
    inputNombre.disabled = false;
    inputApellido.disabled = false;
    inputEmail.disabled = false;
    inputTelefono.disabled = false;
    editProfileButton.style.display = "none";
    saveProfileButton.style.display = "inline-block";
  };

  // Guardar cambios del perfil
  const guardarPerfil = async () => {
    const nombre = inputNombre.value.trim();
    const apellido = inputApellido.value.trim();
    const correoElectronico = inputEmail.value.trim();
    const telefono = inputTelefono.value.trim();

    if (!nombre || !apellido || !correoElectronico || !telefono) {
      Swal.fire({
        icon: "error",
        title: "Campos vacíos",
        text: "Por favor, completa todos los campos.",
      });
      return;
    }

    if (telefono.length !== 10 || isNaN(telefono)) {
      Swal.fire({
        icon: "error",
        title: "Teléfono inválido",
        text: "El teléfono debe tener exactamente 10 dígitos.",
      });
      return;
    }

    const usuarioActualizado = {
      id: usuarioId,
      nombre: nombre,
      apellido: apellido,
      correoElectronico: correoElectronico,
      telefono: parseInt(telefono),
      status: true, // Campo requerido por el DTO
    };

    try {
      const response = await fetch(`${ruta}usuarios/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuarioActualizado),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar los cambios del perfil.");
      }

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Los cambios se guardaron correctamente.",
      }).then(() => {
        inputNombre.disabled = true;
        inputApellido.disabled = true;
        inputEmail.disabled = true;
        inputTelefono.disabled = true;
        editProfileButton.style.display = "inline-block";
        saveProfileButton.style.display = "none";
      });
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo guardar la información del perfil.",
      });
    }
  };

  // Eventos de los botones
  editProfileButton.addEventListener("click", habilitarEdicion);
  saveProfileButton.addEventListener("click", guardarPerfil);

  // Cargar la información del perfil al inicio
  cargarPerfil();
});
