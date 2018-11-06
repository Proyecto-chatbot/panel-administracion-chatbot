window.addEventListener("load",function(){
    let botonMenu = document.getElementById("botonMenu");
    let menuLateral = document.getElementById("menuLateral");
    let background_shadow = document.getElementById("background_shadow");
    let botonCancelar = document.getElementById("botonCancelar");

    let desplegarMenu = function(){
        menuLateral.style.left = "0%";
        background_shadow.style.opacity = "0.5";
        background_shadow.style.visibility = "visible";
    }

    let cerrardesplegarMenu = function(){
        menuLateral.style.left = "-100%";
        background_shadow.style.opacity = "0";
        background_shadow.style.visibility = "hidden";
    }


    botonMenu.addEventListener("click", desplegarMenu);
    botonCancelar.addEventListener("click", cerrardesplegarMenu);
});