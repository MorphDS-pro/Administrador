// Función para cargar la página principal (bienvenida.html)
function cargarPaginaPrincipal() {
    const mainContent = document.getElementById("main-content");

    // Crear un nuevo iframe
    const iframe = document.createElement("iframe");

    // Establecer atributos del iframe
    iframe.src = "Components/Info.html"; // Ruta al archivo bienvenida.html
    iframe.style.width = "100%"; // Ajustar el ancho al 100% de la pantalla
    iframe.style.height = "100%"; // Ajustar la altura al 100% del contenedor
    iframe.frameBorder = "0%"; // Eliminar borde del iframe

    // Limpiar el contenido previo de <main> y agregar el iframe
    mainContent.innerHTML = ""; // Eliminar cualquier contenido anterior
    mainContent.appendChild(iframe); // Agregar el iframe al contenedor
}

// Función para ocultar todos los submenús y contenedores-sección
function ocultarSubmenusYSecciones() {
    // Ocultar todos los submenús
    const allSubmenus = document.querySelectorAll('.submenu');
    allSubmenus.forEach(function(submenu) {
        submenu.style.display = 'none';
    });

    // Ocultar todas las secciones activas
    const allSections = document.querySelectorAll('.contenedor-seccion');
    allSections.forEach(function(section) {
        section.style.display = 'none';
        section.classList.remove('open');
    });
}

// Función para mostrar solo el contenedor principal y ocultar todos los otros elementos
function mostrarPaginaPrincipal() {
    // Llamar a la función para cargar la página principal
    cargarPaginaPrincipal();

    // Ocultar todos los submenús y secciones abiertas
    ocultarSubmenusYSecciones();

    // Mostrar el contenedor principal
    const contenedorPrincipal = document.querySelector('.contenedor-principal');
    contenedorPrincipal.style.display = 'block'; // Mostrar el contenedor principal
}

// Evento al cargar la página para mostrar la bienvenida
window.addEventListener("load", function() {
    mostrarPaginaPrincipal(); // Llama a mostrarPaginaPrincipal al cargar la página
});
