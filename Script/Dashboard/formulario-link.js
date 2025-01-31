// Función para cargar el formulario dentro del contenedor main-content
function cargarFormulario(url) {
    const mainContent = document.getElementById('main-content'); // Seleccionamos el contenedor de contenido principal
    mainContent.innerHTML = ''; // Limpiamos cualquier contenido previamente cargado

    // Creamos un iframe para cargar el formulario
    const iframe = document.createElement('iframe');
    iframe.src = url; // Establecemos la URL del formulario a cargar
    iframe.width = "99%"; // Establecemos el ancho del iframe
    iframe.height = "805px"; // Establecemos una altura adecuada para el iframe
    iframe.frameBorder = "0%"; // Eliminar borde del iframe


    // Añadimos el iframe al contenedor main-content
    mainContent.appendChild(iframe);
}

// Agregar eventos para los enlaces de la barra lateral
document.addEventListener('DOMContentLoaded', function() {
    // Agregar eventos de clic en los enlaces de la barra lateral
    const links = document.querySelectorAll('.formulario-link');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Evitamos que el enlace haga su acción por defecto

            const target = this.getAttribute('data-target'); // Obtenemos la ruta del formulario desde el atributo data-target
            cargarFormulario(target); // Llamamos a la función para cargar el formulario
        });
    });
});
