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

document.addEventListener('DOMContentLoaded', mostrarFecha);
