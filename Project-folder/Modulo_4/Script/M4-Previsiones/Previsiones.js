// Importar las funciones necesarias desde firebase.js
import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs, onSnapshot, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables del DOM
const tableBody = document.getElementById('table-body');
const pagination = document.getElementById('pagination');
const btnGuardar = document.getElementById('btnGuardar');
const formRegistrarContainer = document.getElementById('formRegistrarContainer');
const overlay = document.getElementById('overlay');
const messagesContainer = document.getElementById('messagesContainer');
const deleteContainer = document.getElementById('deleteContainer');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const deleteTitle = document.getElementById('deleteTitle');

// Variables de paginación
let currentPage = 1;
const rowsPerPage = 20;
let previsiones = [];

// Función para generar un ID correlativo
async function getNextId() {
    const previsionesSnapshot = await getDocs(collection(db, 'previsiones'));
    let maxId = 0;

    previsionesSnapshot.forEach((doc) => {
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

// Mostrar mensaje de éxito o error
function showMessage(type, message) {
    const messageElement = document.getElementById(`message${capitalize(type)}`);
    const messageText = document.getElementById(`${type}Text`);

    messageText.textContent = message;
    messageElement.classList.remove('hidden');

    const closeButton = document.getElementById(`closeMessage${capitalize(type)}`);
    closeButton.onclick = () => {
        messageElement.classList.add('hidden');
    };
}

// Función para capitalizar la primera letra de una cadena
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para mostrar/ocultar spinner
function showSpinner(show) {
    const spinner = document.getElementById('spinner');
    spinner.classList.toggle('hidden', !show);
}

// Evento para guardar previsión
btnGuardar.onclick = async (e) => {
    e.preventDefault();
    overlay.classList.remove('hidden');

    try {
        const prevision = document.getElementById('registrarPrevision').value;
        const usuario = document.getElementById('registrarUsuario').textContent.trim() || (auth.currentUser ? auth.currentUser.email : 'Anónimo');
        const newId = await getNextId();

        await addDoc(collection(db, 'previsiones'), {
            id: newId,
            prevision,
            usuario,
            fecha: new Date(),
        });

        showMessage('success', `La previsión "${prevision}" ha sido registrada con éxito.`);
        document.getElementById('registrarPrevision').value = '';
    } catch (error) {
        console.error("Error al registrar previsión:", error);
        showMessage('error', 'Error al registrar la previsión. Intenta nuevamente.');
    } finally {
        overlay.classList.add('hidden');
    }
};

// Función para cargar las previsiones en la tabla
function loadPrevisiones() {
    onSnapshot(collection(db, 'previsiones'), (querySnapshot) => {
        tableBody.innerHTML = '';
        previsiones = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            previsiones.push({ id: parseInt(data.id, 10), data, docId: doc.id });
        });

        previsiones.sort((a, b) => a.id - b.id);
        renderTable();
        renderPagination();
    });
}

// Renderizar tabla con datos paginados
function renderTable() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const previsionesToShow = previsiones.slice(startIndex, endIndex);

    previsionesToShow.forEach((previsionObj) => {
        const data = previsionObj.data;
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><button class="delete-btn" data-id="${previsionObj.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${data.id}</td>
            <td>${data.prevision}</td>
            <td>${data.fecha?.toDate().toLocaleDateString() || 'No disponible'}</td>
            <td>${data.usuario}</td>
        `;

        tableBody.appendChild(row);

        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.onclick = () => confirmDelete(previsionObj);
    });
}

// Confirmar eliminación
function confirmDelete(previsionObj) {
    deleteTitle.textContent = `¿Estás seguro de que deseas eliminar la previsión "${previsionObj.data.prevision}"?`;
    deleteContainer.classList.remove('hidden');

    btnConfirmarEliminar.onclick = async () => {
        showSpinner(true);
        try {
            await deleteDoc(doc(db, 'previsiones', previsionObj.docId));
            showMessage('success', `La previsión "${previsionObj.data.prevision}" ha sido eliminada.`);
        } catch (error) {
            console.error("Error al eliminar previsión:", error);
            showMessage('error', 'Error al eliminar la previsión. Intenta nuevamente.');
        } finally {
            showSpinner(false);
            deleteContainer.classList.add('hidden');
        }
    };

    btnCancelarEliminar.onclick = () => {
        deleteContainer.classList.add('hidden');
    };
}

// Renderizar paginación
function renderPagination() {
    const totalPages = Math.ceil(previsiones.length / rowsPerPage);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.onclick = () => {
            currentPage = i;
            renderTable();
        };
        pagination.appendChild(pageButton);
    }
}

// Inicializar la carga de datos
window.onload = loadPrevisiones;
