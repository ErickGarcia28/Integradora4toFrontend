// Cuando la ventana se carga completamente
window.addEventListener('load', function() {
    // Guardamos la posición del scroll cuando se carga la página
    const scrollPosition = window.scrollY;

    // Mostramos el loader
    $('#load').fadeOut(500, function() {
        // Eliminamos la clase 'hidden' que oculta el contenido
        $('body').removeClass('hidden');
        
        // Restauramos la posición original del scroll
        window.scrollTo(0, scrollPosition);  
    });
});

// Evitar mostrar el body antes de que todo esté cargado
$(document).ready(function() {
    // Añadir la clase 'hidden' al body, lo cual mantiene el contenido oculto al inicio
    $('body').addClass('hidden');
});

// Cuando se carga la página, se asigna un tamaño al contenido para evitar el espacio vacío
window.addEventListener('load', function() {
    // Aquí aseguramos que la página ocupa toda la pantalla, con un mínimo de altura
    $('body').css('height', '100%');
});
