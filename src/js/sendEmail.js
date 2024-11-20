

document.getElementById('loginForm').addEventListener('submit', function(event){

event.preventDefault();

    Swal.fire({
        icon: 'success',
        title: 'Código enviado',
        text: 'El código ha sido enviado a tu correo.',
        confirmButtonText: 'Aceptar',
    })
});