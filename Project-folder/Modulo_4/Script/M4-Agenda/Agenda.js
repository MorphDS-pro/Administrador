// Importar las funciones necesarias desde firebase.js
import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

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
let Contactos = [];

// Función para generar un ID correlativo
async function getNextId() {
    const ContactosSnapshot = await getDocs(collection(db, 'internos'));
    let maxId = 0;

    ContactosSnapshot.forEach((doc) => {
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

// Evento para guardar contacto
// Evento para guardar contacto
btnGuardar.onclick = async (e) => {
    e.preventDefault();
    overlay.classList.remove('hidden');

    try {
        const unidadId = document.getElementById('unidadSelect').value;  // ID de la unidad
        if (!unidadId) {
            showMessage('error', 'Por favor, selecciona una unidad.');
            return;
        }

        console.log('unidadId:', unidadId);  // Verificar el ID seleccionado

        const representante = document.getElementById('registrarRepresentante').value;
        const correo = document.getElementById('registrarCorreo').value;
        const telefono = document.getElementById('registrarTelefono').value;
        const anexo = document.getElementById('registrarAnexo').value;
        const observacion = document.getElementById('registrarObservacion').value;
        const usuario = document.getElementById('registrarUsuario').textContent.trim() || (auth.currentUser ? auth.currentUser.email : 'Anónimo');
        const newId = await getNextId();

        // Obtener el nombre de la unidad por su ID
        const unidadDoc = await getDoc(doc(db, 'unidades', unidadId));
        console.log('unidadDoc:', unidadDoc.exists(), unidadDoc.data()); // Verificar que el documento existe

        let unidadNombre = '';
        if (unidadDoc.exists()) {
            unidadNombre = unidadDoc.data().nombre;  // Guardar el nombre de la unidad
            console.log('Unidad encontrada:', unidadNombre);  // Mostrar nombre de la unidad
        } else {
            console.error('No se encontró la unidad con el ID:', unidadId);
            showMessage('error', 'No se encontró la unidad seleccionada.');
            return;
        }

        // Ahora guardamos tanto el ID como el nombre de la unidad
        await addDoc(collection(db, 'internos'), {
            id: newId,
            unidadId,   // Guardar solo el ID de la unidad
            unidad: unidadNombre, // Guardar el nombre de la unidad
            representante,
            correo,
            telefono,
            anexo,
            observacion,
            usuario,
            fecha: new Date(),
        });

        showMessage('success', `El contacto "${unidadNombre}" ha sido registrado con éxito.`);
        document.getElementById('unidadSelect').value = '';  // Limpiar el select
        document.getElementById('registrarRepresentante').value = '';
        document.getElementById('registrarCorreo').value = '';
        document.getElementById('registrarTelefono').value = '';
        document.getElementById('registrarAnexo').value = '';
        document.getElementById('registrarObservacion').value = '';
        document.getElementById('registrarUsuario').value = '';

    } catch (error) {
        console.error("Error al registrar contacto:", error);
        showMessage('error', 'Error al registrar el contacto. Intenta nuevamente.');
    } finally {
        overlay.classList.add('hidden');
    }
};

// Función para cargar los contactos en la tabla
function loadContactos() {
    onSnapshot(collection(db, 'internos'), (querySnapshot) => {
        tableBody.innerHTML = '';
        Contactos = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            Contactos.push({ id: parseInt(data.id, 10), data, docId: doc.id });
        });

        Contactos.sort((a, b) => a.id - b.id);
        renderTable();
        renderPagination();
    });
}

// Renderizar tabla con datos paginados
function renderTable() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const ContactosToShow = Contactos.slice(startIndex, endIndex);

    // Limpiar el contenido de la tabla antes de renderizar
    tableBody.innerHTML = '';

    ContactosToShow.forEach((contactoObj) => {
        const data = contactoObj.data;
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><button class="delete-btn" data-id="${contactoObj.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${data.id}</td>
            <td>${data.unidad}</td>  <!-- Ahora muestra el nombre de la unidad -->
            <td>${data.representante}</td>
            <td>${data.correo}</td>
            <td>${data.telefono}</td>
            <td>${data.anexo}</td>
            <td>${data.observacion}</td>
            <td>${data.fecha?.toDate().toLocaleDateString() || 'No disponible'}</td>
            <td>${data.usuario}</td>
        `;

        tableBody.appendChild(row);

        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.onclick = () => confirmDelete(contactoObj);
    });
}


// Confirmar eliminación
function confirmDelete(contactoObj) {
    deleteTitle.textContent = `¿Estás seguro de que deseas eliminar al contacto de la empresa "${contactoObj.data.empresa}"?`;
    deleteContainer.classList.remove('hidden');

    btnConfirmarEliminar.onclick = async () => {
        showSpinner(true);
        try {
            await deleteDoc(doc(db, 'contactos', contactoObj.docId));
            showMessage('success', `El contacto de la empresa "${contactoObj.data.empresa}" ha sido eliminado.`);
        } catch (error) {
            console.error("Error al eliminar el contacto:", error);
            showMessage('error', 'Error al eliminar el contacto. Intenta nuevamente.');
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
    const totalPages = Math.ceil(Contactos.length / rowsPerPage);
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
window.onload = loadContactos;
