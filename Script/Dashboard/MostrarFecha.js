// Función para obtener la fecha actual y formatearla
function mostrarFecha() {
    const fechaActual = new Date();
    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);
    const dateElement = document.getElementById('date');
    
    if (dateElement) {
        dateElement.innerHTML = fechaFormateada;
    }
}

// Esperar a que el DOM esté completamente cargado antes de ejecutar la función
document.addEventListener('DOMContentLoaded', mostrarFecha);
