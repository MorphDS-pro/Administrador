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
let medicos = [];

// Función para generar un ID correlativo
async function getNextId() {
    const medicosSnapshot = await getDocs(collection(db, 'medicos'));
    let maxId = 0;

    medicosSnapshot.forEach((doc) => {
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

// Evento para guardar médico
btnGuardar.onclick = async (e) => {
    e.preventDefault();
    overlay.classList.remove('hidden');

    try {
        const nombre = document.getElementById('registrarMedico').value;
        const usuario = document.getElementById('registrarUsuario').textContent.trim() || (auth.currentUser ? auth.currentUser.email : 'Anónimo');
        const newId = await getNextId();

        await addDoc(collection(db, 'medicos'), {
            id: newId,
            nombre,
            usuario,
            fecha: new Date(),
        });

        showMessage('success', `El médico "${nombre}" ha sido registrado con éxito.`);
        document.getElementById('registrarMedico').value = '';
    } catch (error) {
        console.error("Error al registrar médico:", error);
        showMessage('error', 'Error al registrar el médico. Intenta nuevamente.');
    } finally {
        overlay.classList.add('hidden');
    }
};

// Función para cargar los médicos en la tabla
function loadMedicos() {
    onSnapshot(collection(db, 'medicos'), (querySnapshot) => {
        tableBody.innerHTML = '';
        medicos = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            medicos.push({ id: parseInt(data.id, 10), data, docId: doc.id });
        });

        medicos.sort((a, b) => a.id - b.id);
        renderTable();
        renderPagination();
    });
}

// Renderizar tabla con datos paginados
function renderTable() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const medicosToShow = medicos.slice(startIndex, endIndex);

    medicosToShow.forEach((medicoObj) => {
        const data = medicoObj.data;
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><button class="delete-btn" data-id="${medicoObj.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${data.id}</td>
            <td>${data.nombre}</td>
            <td>${data.fecha?.toDate().toLocaleDateString() || 'No disponible'}</td>
            <td>${data.usuario}</td>
        `;

        tableBody.appendChild(row);

        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.onclick = () => confirmDelete(medicoObj);
    });
}

// Confirmar eliminación
function confirmDelete(medicoObj) {
    deleteTitle.textContent = `¿Estás seguro de que deseas eliminar al médico "${medicoObj.data.nombre}"?`;
    deleteContainer.classList.remove('hidden');

    btnConfirmarEliminar.onclick = async () => {
        showSpinner(true);
        try {
            await deleteDoc(doc(db, 'medicos', medicoObj.docId));
            showMessage('success', `El médico "${medicoObj.data.nombre}" ha sido eliminado.`);
        } catch (error) {
            console.error("Error al eliminar médico:", error);
            showMessage('error', 'Error al eliminar el médico. Intenta nuevamente.');
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
    const totalPages = Math.ceil(medicos.length / rowsPerPage);
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
window.onload = loadMedicos;
