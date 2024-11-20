

document.getElementById('loginForm').addEventListener('submit', function(event){

    event.preventDefault();
    
        Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Gracias por unirte',
            confirmButtonText: 'Aceptar',
        })
    });