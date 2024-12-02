
window.addEventListener('load', function() {
    
    const scrollPosition = window.scrollY;

    
    $('#load').fadeOut(500, function() {
        
        $('body').removeClass('hidden');
        
        
        window.scrollTo(0, scrollPosition);  
    });
});


$(document).ready(function() {
    
    $('body').addClass('hidden');
});


window.addEventListener('load', function() {
    
    $('body').css('height', '100%');
});
