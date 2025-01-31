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
const spinner = document.getElementById('spinner');
const messagesContainer = document.getElementById('messagesContainer');
const tableBody = document.getElementById('table-body');

// Función para mostrar mensajes
function showMessage(type, message) {
    const messageElement = document.getElementById(`message${capitalize(type)}`);
    const messageText = document.getElementById(`${type}Text`);
    messageText.textContent = message;
    messageElement.classList.remove('hidden');
    document.getElementById(`closeMessage${capitalize(type)}`).addEventListener('click', () => {
        messageElement.classList.add('hidden');
    });
}

// Capitalizar la primera letra
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Mostrar/ocultar spinner
function toggleSpinner(show) {
    overlay.classList.toggle('visible', show);
}

// Mostrar/ocultar contenedor de importación
function toggleImportContainer(show) {
    importContainer.classList.toggle('hidden', !show);
    overlay.classList.toggle('hidden', !show);
}

// Obtener el próximo ID incremental
async function getNextId() {
    const empresasSnapshot = await getDocs(collection(db, 'previsiones'));
    let maxId = 0;
    empresasSnapshot.forEach(doc => {
        const docId = parseInt(doc.data().id, 10);
        if (!isNaN(docId) && docId > maxId) maxId = docId;
    });
    return (maxId + 1).toString().padStart(3, '0');
}

// Procesar archivo Excel e importar datos a Firebase
async function processFile() {
    const file = fileInput.files[0];
    if (!file) return showMessage('error', 'Por favor, selecciona un archivo.');

    toggleSpinner(true);

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!rows.length) return showMessage('error', 'Archivo vacío o formato inválido.');

        for (const { empresa, rut } of rows) {
            if (!empresa || !rut) continue;

            const usuario = importUsuario.textContent.trim() || (auth.currentUser?.email || 'Anónimo');
            const newId = await getNextId();

            await addDoc(collection(db, 'empresas'), {
                id: newId,
                empresa,
                rut,
                usuario,
                fecha: Timestamp.fromDate(new Date()),
            });
        }

        showMessage('success', 'Datos importados con éxito.');
        fileInput.value = '';
        toggleImportContainer(false);
    } catch (error) {
        console.error('Error al importar:', error);
        showMessage('error', 'Error al importar datos.');
    } finally {
        toggleSpinner(false);
    }
}

// Renderizar la tabla con datos
function renderTable(empresas) {
    tableBody.innerHTML = empresas.map(({ id, empresa, rut, usuario, fecha }) => `
        <tr>
            <td>${id}</td>
            <td>${empresa}</td>
            <td>${rut}</td>
            <td>${usuario}</td>
            <td>${fecha instanceof Timestamp ? fecha.toDate().toLocaleDateString('es-CL') : 'Sin fecha'}</td>
        </tr>
    `).join('');
}

// Escuchar cambios en la colección
onSnapshot(collection(db, 'empresas'), (querySnapshot) => {
    const empresas = querySnapshot.docs.map(doc => doc.data());
    renderTable(empresas);
});

// Eventos del DOM
importButton.addEventListener('click', () => toggleImportContainer(true));
closeImportButton.addEventListener('click', () => toggleImportContainer(false));
cancelImportButton.addEventListener('click', () => toggleImportContainer(false));
btnImportar.addEventListener('click', processFile);
