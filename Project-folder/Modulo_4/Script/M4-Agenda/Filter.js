// Importar las funciones necesarias desde firebase.js
import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables del DOM
const buscarRepresentanteInput = document.getElementById('buscarRepresentante');
const buscarUnidadInput = document.getElementById('buscarUnidad'); // Cambiado de "buscarEmpresa" a "buscarUnidad"
const tableBody = document.getElementById('table-body');
const itemsPerPage = 20; // Número de contactos por página
let currentPage = 1; // Página actual
let contactos = []; // Variable global para almacenar los contactos

// Función para obtener todos los contactos de la base de datos
async function getContactos() {
    try {
        const querySnapshot = await getDocs(collection(db, 'internos'));
        contactos = []; // Limpiar la variable de contactos antes de llenarla con nuevos datos
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            contactos.push({
                ...data,
                docId: doc.id, // Agregar el id del documento para referencia
            });
        });

        // Ordenar los contactos por representante (puedes cambiar el campo si es necesario)
        contactos.sort((a, b) => a.representante.localeCompare(b.representante));

        renderTable(contactos);  // Llamamos a la función de renderizado con los datos obtenidos
        renderPagination(contactos.length);  // Renderizar paginación
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para filtrar los datos según el nombre del representante o unidad
function filterData() {
    const representanteFilter = buscarRepresentanteInput.value.trim().toLowerCase();
    const unidadFilter = buscarUnidadInput.value.trim().toLowerCase();  // Cambio de "empresa" a "unidad"

    // Filtrar los contactos según el valor de búsqueda
    return contactos.filter(contacto => {
        const matchRepresentante = contacto.representante.toLowerCase().includes(representanteFilter);
        const matchUnidad = contacto.unidad.toLowerCase().includes(unidadFilter);  // Cambio de "empresa" a "unidad"

        // Mostrar solo los contactos que coincidan con ambos filtros
        return matchRepresentante && matchUnidad;
    });
}

// Función para renderizar la tabla con los datos filtrados y paginados
function renderTable(contactos) {
    const filteredContactos = filterData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageContactos = filteredContactos.slice(startIndex, startIndex + itemsPerPage);

    tableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    currentPageContactos.forEach(contacto => {
        let fecha;
        if (contacto.fecha) {
            fecha = new Date(contacto.fecha.seconds * 1000).toLocaleDateString('es-CL'); // Convertir el timestamp a fecha
        } else {
            fecha = 'Sin fecha';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><button class="delete-btn" data-id="${contacto.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${contacto.id}</td>
            <td>${contacto.unidad}</td>  <!-- Cambio de "empresa" a "unidad" -->
            <td>${contacto.representante}</td>
            <td>${contacto.correo}</td>
            <td>${contacto.telefono}</td>
            <td>${contacto.anexo}</td>
            <td>${contacto.observacion}</td>
            <td>${contacto.usuario || 'No disponible'}</td>
            <td>${fecha}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para renderizar la paginación
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination'); // Asegúrate de tener un contenedor con id 'pagination'

    paginationContainer.innerHTML = ''; // Limpiar paginación

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.classList.add('page-btn');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderTable(contactos); // Actualizar la tabla al cambiar de página
            renderPagination(totalItems); // Actualizar los botones de paginación
        });
        paginationContainer.appendChild(pageButton);
    }
}

// Agregar evento al campo de búsqueda para filtrar los datos en tiempo real
document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse que el DOM está completamente cargado antes de agregar los eventos
    buscarRepresentanteInput.addEventListener('input', () => {
        currentPage = 1; // Resetear a la primera página al buscar
        renderTable(contactos);  // Actualizar la tabla con los datos filtrados
        renderPagination(contactos.length); // Actualizar la paginación
    });

    buscarUnidadInput.addEventListener('input', () => {  // Cambio de "empresaInput" a "unidadInput"
        currentPage = 1; // Resetear a la primera página al buscar
        renderTable(contactos);  // Actualizar la tabla con los datos filtrados
        renderPagination(contactos.length); // Actualizar la paginación
    });
});

// Inicializar la tabla al cargar la página
getContactos();
