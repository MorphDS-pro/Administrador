// Función para formatear el RUT
function formatRUT(rut) {
    // Eliminar caracteres que no sean números o la letra 'K' o 'k'
    rut = rut.replace(/[^\dKk]/g, '');

    // Limitar a un máximo de 9 caracteres (8 números + 1 dígito verificador)
    rut = rut.substring(0, 9);

    // Si el RUT tiene más de 2 dígitos, agregar el primer punto
    if (rut.length > 2) {
        rut = rut.replace(/^(\d{2})(\d)/, '$1.$2');
    }

    // Si el RUT tiene más de 5 dígitos, agregar el segundo punto
    if (rut.length > 5) {
        rut = rut.replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2');
    }

    // Si el RUT tiene más de 8 dígitos, agregar el guion antes del dígito verificador
    if (rut.length > 8) {
        rut = rut.replace(/^(\d{2}\.\d{3}\.\d{3})(\d|[Kk])/, '$1-$2');
    }

    return rut.toUpperCase(); // Convertir la letra 'k' a mayúscula
}

// Función para validar el formato del RUT
function validateRUT(rut) {
    // Expresión regular para verificar el formato: XX.XXX.XXX-X o XX.XXX.XXX-K
    const rutRegex = /^\d{2}\.\d{3}\.\d{3}-[\dKk]$/;
    return rutRegex.test(rut);
}

// Función para mostrar un mensaje (por ejemplo, para mostrar errores)
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerHTML = `<p class="${type}">${message}</p>`;
}

// Esperar a que el DOM esté cargado antes de agregar los eventos
document.addEventListener('DOMContentLoaded', function () {
    // Seleccionamos los campos de entrada para el RUT en los diferentes formularios
    const rutEmpresaInput = document.querySelector('#registrarRut');
    const buscarRutInput = document.querySelector('#buscarRut');
    const editRutEmpresaInput = document.querySelector('#editRutEmpresa');

    // Asegurarnos de que los elementos existen antes de agregar los eventos
    if (rutEmpresaInput) {
        // Evento para formatear el RUT mientras se escribe en el campo de registro
        rutEmpresaInput.addEventListener('input', function (e) {
            let value = e.target.value;
            value = formatRUT(value);
            e.target.value = value;
        });
    }

    if (buscarRutInput) {
        // Evento para formatear el RUT mientras se escribe en el campo de búsqueda
        buscarRutInput.addEventListener('input', function (e) {
            let value = e.target.value;
            value = formatRUT(value);
            e.target.value = value;
        });
    }

    if (editRutEmpresaInput) {
        // Evento para formatear el RUT mientras se escribe en el campo de edición
        editRutEmpresaInput.addEventListener('input', function (e) {
            let value = e.target.value;
            value = formatRUT(value);
            e.target.value = value;
        });
    }

    // Obtener el botón "Crear" del formulario
    const btnCrear = document.querySelector('.btn-crear');


    // Obtener el botón "Guardar Cambios" para la edición
    const btnGuardarCambios = document.querySelector('#btnGuardarCambios');

    // Validar el RUT cuando se hace clic en "Editar"
    if (btnGuardarCambios) {
        btnGuardarCambios.addEventListener('click', function () {
            const rut = editRutEmpresaInput.value;

            // Verificar si el RUT tiene el formato correcto
            if (!validateRUT(rut)) {
                showMessage("Por favor, ingrese un RUT válido (formato: XX.XXX.XXX-X).", "error");
                return;
            }

            // Proceder con la edición si el RUT es válido
            console.log("RUT válido. Procediendo con la edición de la empresa...");
        });
    }

    // Obtener el botón "Buscar"
    const btnBuscar = document.querySelector('#btnBuscar');

    // Validar el RUT cuando se hace clic en el botón "Buscar"
    if (btnBuscar) {
        btnBuscar.addEventListener('click', function () {
            const rut = buscarRutInput.value;

            // Verificar si el RUT tiene el formato correcto
            if (!validateRUT(rut)) {
                showMessage("Por favor, ingrese un RUT válido (formato: XX.XXX.XXX-X).", "error");
                return;
            }

            // Proceder con la búsqueda si el RUT es válido
            console.log("RUT válido. Procediendo con la búsqueda de la empresa...");
        });
    }
});
