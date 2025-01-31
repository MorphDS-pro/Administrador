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
const rowsPerPage = 15;
let empresas = [];

// Función para generar un ID correlativo
async function getNextId() {
    const empresasSnapshot = await getDocs(collection(db, 'empresas'));
    let maxId = 0;

    empresasSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id) {
            const docId = parseInt(data.id, 10); // Convertir el ID a número
            if (!isNaN(docId) && docId > maxId) {
                maxId = docId;
            }
        }
    });

    return (maxId + 1).toString().padStart(3, '0'); // Generar el siguiente ID
}

// Evento para guardar empresa
btnGuardar.addEventListener('click', async (e) => {
    e.preventDefault();

    // Mostrar overlay
    overlay.classList.remove('hidden');
    
    try {
        const empresa = document.getElementById('registrarEmpresas').value;
        const rut = document.getElementById('registrarRut').value;

        // Obtener el nombre del usuario de #registrarUsuario
        const usuario = document.getElementById('registrarUsuario').textContent.trim() || (auth.currentUser ? auth.currentUser.email : 'Anónimo');

        // Obtener el siguiente ID correlativo
        const newId = await getNextId();

        // Agregar nueva empresa a Firestore con el ID generado
        const docRef = await addDoc(collection(db, 'empresas'), {
            id: newId,  // Asignar el ID correlativo
            empresa,
            rut,
            usuario, // Guardar el nombre del usuario digitado o el logueado
            fecha: new Date(),
        });

        // Mostrar mensaje de éxito
        showMessage('success', `La empresa ${empresa} ha sido registrada con éxito.`);
        
        // Limpiar formulario
        document.getElementById('registrarEmpresas').value = '';
        document.getElementById('registrarRut').value = '';
        document.getElementById('registrarUsuario').textContent = ''; // Limpiar el campo de usuario
        
    } catch (error) {
        console.error("Error al registrar empresa: ", error);
        showMessage('error', 'Error al registrar la empresa. Intenta nuevamente.');
    } finally {
        // Ocultar overlay
        overlay.classList.add('hidden');
    }
});

// Mostrar mensaje de éxito o error
function showMessage(type, message) {
    const messageElement = document.getElementById(`message${capitalize(type)}`);
    const messageText = document.getElementById(`${type}Text`);
    
    messageText.textContent = message;
    messageElement.classList.remove('hidden');
    
    // Cerrar mensaje
    const closeButton = document.getElementById(`closeMessage${capitalize(type)}`);
    closeButton.addEventListener('click', () => {
        messageElement.classList.add('hidden');
    });
}

// Función para capitalizar la primera letra
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para cargar las empresas en la tabla (ahora en tiempo real)
function loadEmpresas() {
    // Escuchar los cambios en tiempo real en la colección 'empresas'
    onSnapshot(collection(db, 'empresas'), (querySnapshot) => {
        // Limpiar la tabla antes de agregar los nuevos registros
        tableBody.innerHTML = '';

        // Crear un arreglo de empresas para poder ordenarlas
        empresas = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            empresas.push({ id: parseInt(data.id, 10), data, docId: doc.id }); // Guardar el ID como número para ordenar
        });

        // Ordenar el arreglo por el ID (de menor a mayor)
        empresas.sort((a, b) => a.id - b.id);

        // Mostrar solo las filas correspondientes a la página actual
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const empresasToShow = empresas.slice(startIndex, endIndex);

        // Crear las filas de la tabla con los datos ordenados
        empresasToShow.forEach((empresaObj) => {
            const data = empresaObj.data;
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><button class="delete-btn" data-id="${empresaObj.docId}"><i class="fas fa-trash"></i></button></td> <!-- Ícono de eliminar -->
                <td>${data.id}</td> <!-- Mostrar el ID correlativo -->
                <td>${data.empresa}</td>
                <td>${data.rut}</td>
                <td>${data.fecha && data.fecha.toDate ? data.fecha.toDate().toLocaleDateString() : 'No disponible'}</td>
                <td>${data.usuario}</td> <!-- Mostrar el nombre del usuario que registró -->
            `;
            
            tableBody.appendChild(row);

            // Agregar el evento de eliminar
            const deleteButton = row.querySelector('.delete-btn');
            deleteButton.addEventListener('click', () => {
                // Mostrar el contenedor de confirmación de eliminación
                deleteTitle.textContent = `¿Estás seguro de que deseas eliminar la empresa "${data.empresa}"?`;
                deleteContainer.classList.remove('hidden');

                // Evento para confirmar eliminación
                btnConfirmarEliminar.addEventListener('click', async () => {
                    // Mostrar el spinner mientras se elimina
                    showSpinner(true);

                    try {
                        await deleteDoc(doc(db, 'empresas', empresaObj.docId)); // Eliminar empresa
                        showMessage('success', `La empresa ${data.empresa} ha sido eliminada con éxito.`);
                    } catch (error) {
                        console.error("Error al eliminar empresa: ", error);
                        showMessage('error', 'Error al eliminar la empresa. Intenta nuevamente.');
                    } finally {
                        // Ocultar el spinner
                        showSpinner(false);
                        // Ocultar el contenedor de confirmación
                        deleteContainer.classList.add('hidden');
                    }
                });

                // Evento para cancelar la eliminación
                btnCancelarEliminar.addEventListener('click', () => {
                    // Ocultar el contenedor de confirmación
                    deleteContainer.classList.add('hidden');
                    // Mostrar mensaje de cancelación
                    showMessage('info', 'La eliminación fue cancelada.');
                });
            });
        });

        // Activar paginación
        activatePagination();
    });
}


// Función para activar paginación
function activatePagination() {
    // Calcular cuántas páginas serán necesarias
    const totalPages = Math.ceil(empresas.length / rowsPerPage);
    
    // Mostrar los botones de la paginación
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadEmpresas();  // Cargar las empresas correspondientes a la página seleccionada
        });
        pagination.appendChild(pageButton);
    }

    // Agregar el texto "Página X"
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${currentPage}`;
    pagination.appendChild(pageInfo);
}

// Función para mostrar el spinner (ocultar o mostrar)
function showSpinner(show) {
    const spinner = document.getElementById('spinner');
    if (show) {
        spinner.classList.remove('hidden'); // Mostrar spinner
    } else {
        spinner.classList.add('hidden'); // Ocultar spinner
    }
}

// Cargar empresas al cargar la página
window.onload = loadEmpresas;
