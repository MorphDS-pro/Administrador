// Importar las funciones necesarias desde firebase.js
import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs, onSnapshot, Timestamp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables del DOM
const importButton = document.getElementById('bttnImport');
const importContainer = document.getElementById('importContainer');
const closeImportButton = document.getElementById('close-import-container');
const cancelImportButton = document.getElementById('btnCancelar');
const fileInput = document.getElementById('fileInput');
const btnImportar = document.getElementById('btnImportar');
const importUsuario = document.getElementById('importUsuario');
const overlay = document.getElementById('overlay');

// Spinner y mensajes
const spinner = document.getElementById('spinner');
const messagesContainer = document.getElementById('messagesContainer');
const tableBody = document.getElementById('table-body');

// Función para mostrar mensajes
function showMessage(type, message) {
    const messageElement = document.getElementById(`message${capitalize(type)}`);
    const messageText = document.getElementById(`${type}Text`);
    messageText.textContent = message;
    messageElement.classList.remove('hidden');
    const closeButton = document.getElementById(`closeMessage${capitalize(type)}`);
    closeButton.addEventListener('click', () => {
        messageElement.classList.add('hidden');
    });
}

// Función para capitalizar la primera letra
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para mostrar el spinner
function showSpinner(show) {
    if (show) {
        overlay.classList.add('visible');  // Muestra el spinner
    } else {
        overlay.classList.remove('visible');  // Oculta el spinner
    }
}

// Función para mostrar el contenedor de importación
function showImportContainer() {
    importContainer.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

// Función para ocultar el contenedor de importación
function hideImportContainer() {
    importContainer.classList.add('hidden');
    overlay.classList.add('hidden');
}

// Función para obtener el próximo ID incremental
async function getNextId() {
    const unidadesSnapshot = await getDocs(collection(db, 'unidades'));
    let maxId = 0;

    unidadesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id) {
            const docId = parseInt(data.id, 10);
            if (!isNaN(docId) && docId > maxId) {
                maxId = docId;
            }
        }
    });

    return (maxId + 1).toString().padStart(3, '0');
}

// Función para procesar el archivo Excel y guardar los datos en Firebase
btnImportar.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        showMessage('error', 'Por favor, selecciona un archivo para importar.');
        return;
    }

    // Mostrar el spinner mientras se procesa el archivo
    showSpinner(true);

    try {
        // Leer el archivo Excel
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });

        // Obtener la primera hoja de trabajo
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convertir los datos de la hoja en un array de objetos
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
            showMessage('error', 'El archivo está vacío o no tiene un formato válido.');
            return;
        }

        // Procesar cada fila del archivo
        for (const row of rows) {
            const nombre = row['Nombre de la unidad']; // Extraer nombre de la columna "Nombre del Médico"

            // Verificar si los datos de la fila son correctos
            if (!nombre) {
                console.log('Fila incompleta:', row);
                continue; // Omitir filas incompletas
            }

            // Obtener el usuario del campo #importUsuario o el usuario logueado
            const usuario = importUsuario.textContent.trim() || (auth.currentUser ? auth.currentUser.email : 'Anónimo');

            // Obtener el próximo ID incremental
            const newId = await getNextId();

            console.log('Preparando datos para guardar en Firebase:', { id: newId, nombre, usuario });

            // Guardar los datos en Firestore
            try {
                await addDoc(collection(db, 'unidades'), {
                    id: newId,
                    nombre,  // Solo se guarda el nombre
                    usuario,
                    fecha: Timestamp.fromDate(new Date()),  // Usar Timestamp de Firebase
                });
                console.log('Datos guardados correctamente:', { id: newId, nombre, usuario });
            } catch (error) {
                console.error('Error al guardar datos en Firebase:', error);
                showMessage('error', 'Ocurrió un error al guardar los datos en Firebase.');
            }
        }

        // Mostrar mensaje de éxito
        showMessage('success', 'Los datos han sido importados con éxito.');

        // Limpiar el input de archivo
        fileInput.value = '';
        hideImportContainer();
    } catch (error) {
        console.error('Error al importar los datos:', error);
        showMessage('error', 'Ocurrió un error al importar los datos.');
    } finally {
        // Ocultar el spinner
        showSpinner(false);
    }
});

// Escuchar cambios en la colección de médicos
onSnapshot(collection(db, 'unidades'), (querySnapshot) => {
    const unidades = [];
    querySnapshot.forEach((doc) => {
        unidades.push(doc.data());
    });
    // Llamar a la función de renderizado de la tabla con los datos obtenidos
    renderTable(unidades);
});

// Función para renderizar la tabla
function renderTable(unidades) {
    tableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    unidades.forEach(unidad => {
        // Verificar y manejar diferentes formatos de fecha
        let fecha;
        if (unidad.fecha instanceof Timestamp) {
            fecha = unidad.fecha.toDate().toLocaleDateString('es-CL');
        } else if (typeof unidad.fecha === 'string') {
            // Intentar formatear cadenas de fecha
            fecha = new Date(unidad.fecha).toLocaleDateString('es-CL');
        } else {
            fecha = 'Sin fecha'; // Manejo de fechas no válidas o ausentes
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${unidad.id}</td>
            <td>${unidad.nombre}</td> <!-- Solo el nombre -->
            <td>${unidad.usuario}</td>
            <td>${fecha}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Eventos para abrir y cerrar el contenedor
importButton.addEventListener('click', showImportContainer);
closeImportButton.addEventListener('click', hideImportContainer);
cancelImportButton.addEventListener('click', hideImportContainer);
