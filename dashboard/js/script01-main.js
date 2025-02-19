function cargarPaginaPrincipal() {
    const mainContent = document.getElementById("main-content");

    const iframe = document.createElement("iframe");

    iframe.src = "info/info.html";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.frameBorder = "0%";

    mainContent.innerHTML = "";
    mainContent.appendChild(iframe);
}

function ocultarSubmenusYSecciones() {
    const allSubmenus = document.querySelectorAll('.submenu');
    allSubmenus.forEach(function(submenu) {
        submenu.style.display = 'none';
    });

    const allSections = document.querySelectorAll('.contenedor-seccion');
    allSections.forEach(function(section) {
        section.style.display = 'none';
        section.classList.remove('open');
    });
}

function mostrarPaginaPrincipal() {
    cargarPaginaPrincipal();
    ocultarSubmenusYSecciones();

    const contenedorPrincipal = document.querySelector('.contenedor-principal');
    contenedorPrincipal.style.display = 'block';
}

window.addEventListener("load", function() {
    mostrarPaginaPrincipal();
});
