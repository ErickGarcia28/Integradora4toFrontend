document.addEventListener('DOMContentLoaded', function () {
    const pass = document.getElementById('inputPass');
    const toggle = document.getElementById('toggle');
    const confirmPass = document.getElementById('confirmPass');
    const toggleConfirm = document.getElementById('toggleConfirm');

    toggle.addEventListener('click', showHide);
    if(toggleConfirm){
        toggleConfirm.addEventListener('click', showHideConfirm);
    }

    function showHide() {
        if (pass.type === 'password') {
            pass.setAttribute('type', 'text');
            toggle.style.background = "url('/img/eye.svg')"; 
        } else {
            pass.setAttribute('type', 'password');
            toggle.style.background = "url('/img/eye-off.svg')"; 
        }
    }

    function showHideConfirm() {
        if (confirmPass.type === 'password') {
            confirmPass.setAttribute('type', 'text');
            toggleConfirm.style.background = "url('/img/eye.svg')"; 
        } else {
            confirmPass.setAttribute('type', 'password');
            toggleConfirm.style.background = "url('/img/eye-off.svg')"; 
        }
    }
});


