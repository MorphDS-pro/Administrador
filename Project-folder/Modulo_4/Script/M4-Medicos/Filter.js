// Importar las funciones necesarias desde firebase.js
import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables del DOM
const buscarMedicoInput = document.getElementById('buscarMedico');
const tableBody = document.getElementById('table-body');
const itemsPerPage = 20; // Número de médicos por página
let currentPage = 1; // Página actual
let medicos = []; // Variable global para almacenar los médicos

// Función para obtener todos los médicos de la base de datos
async function getMedicos() {
    try {
        const querySnapshot = await getDocs(collection(db, 'medicos'));
        medicos = []; // Limpiar la variable de médicos antes de llenarla con nuevos datos
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            medicos.push({
                ...data,
                docId: doc.id, // Agregar el id del documento para referencia
            });
        });

        // Ordenar los médicos por nombre (puedes cambiar el campo si es necesario)
        medicos.sort((a, b) => a.nombre.localeCompare(b.nombre));

        renderTable(medicos);  // Llamamos a la función de renderizado con los datos obtenidos
        renderPagination(medicos.length);  // Renderizar paginación
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para filtrar los datos según el nombre del médico
function filterData() {
    const medicoFilter = buscarMedicoInput.value.trim().toLowerCase();

    // Filtrar los médicos según el valor de búsqueda
    return medicos.filter(medico => {
        const matchMedico = medico.nombre.toLowerCase().includes(medicoFilter);
        return matchMedico; // Mostrar solo los médicos que coincidan con el filtro
    });
}

// Función para renderizar la tabla con los datos filtrados y paginados
function renderTable(medicos) {
    const filteredMedicos = filterData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageMedicos = filteredMedicos.slice(startIndex, startIndex + itemsPerPage);

    tableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    currentPageMedicos.forEach(medico => {
        let fecha;
        if (medico.fecha) {
            fecha = new Date(medico.fecha.seconds * 1000).toLocaleDateString('es-CL'); // Convertir el timestamp a fecha
        } else {
            fecha = 'Sin fecha';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><button class="delete-btn" data-id="${medico.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${medico.id}</td>
            <td>${medico.nombre}</td>
            <td>${medico.usuario || 'No disponible'}</td>
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
            renderTable(medicos); // Actualizar la tabla al cambiar de página
            renderPagination(totalItems); // Actualizar los botones de paginación
        });
        paginationContainer.appendChild(pageButton);
    }
}

// Agregar evento al campo de búsqueda para filtrar los datos en tiempo real
buscarMedicoInput.addEventListener('input', () => {
    currentPage = 1; // Resetear a la primera página al buscar
    renderTable(medicos);  // Actualizar la tabla con los datos filtrados
    renderPagination(medicos.length); // Actualizar la paginación
});

// Inicializar la tabla al cargar la página
getMedicos();
