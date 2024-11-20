

function checkLength(input) {
    if (input.value.length > 8) {
        input.value = input.value.slice(0, 8); 
    }
}