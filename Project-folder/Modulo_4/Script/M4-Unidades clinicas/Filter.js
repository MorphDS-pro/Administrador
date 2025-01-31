import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const buscarunidadInput = document.getElementById('buscarUnidad');
const tableBody = document.getElementById('table-body');
const itemsPerPage = 20; 
let currentPage = 1;
let unidades = []; 

async function getunidades() {
    try {
        const querySnapshot = await getDocs(collection(db, 'unidades'));
        unidades = []; // Limpiar la variable de médicos antes de llenarla con nuevos datos
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            unidades.push({
                ...data,
                docId: doc.id, // Agregar el id del documento para referencia
            });
        });

        // Ordenar los médicos por nombre (puedes cambiar el campo si es necesario)
        unidades.sort((a, b) => a.nombre.localeCompare(b.nombre));

        renderTable(unidades);  // Llamamos a la función de renderizado con los datos obtenidos
        renderPagination(unidades.length);  // Renderizar paginación
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para filtrar los datos según el nombre del médico
function filterData() {
    const unidadFilter = buscarunidadInput.value.trim().toLowerCase();

    // Filtrar los médicos según el valor de búsqueda
    return unidades.filter(unidad => {
        const matchunidad = unidad.nombre.toLowerCase().includes(unidadFilter);
        return matchunidad; // Mostrar solo los médicos que coincidan con el filtro
    });
}

// Función para renderizar la tabla con los datos filtrados y paginados
function renderTable(unidades) {
    const filteredunidades = filterData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageunidades = filteredunidades.slice(startIndex, startIndex + itemsPerPage);

    tableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    currentPageunidades.forEach(unidad => {
        let fecha;
        if (unidad.fecha) {
            fecha = new Date(unidad.fecha.seconds * 1000).toLocaleDateString('es-CL'); // Convertir el timestamp a fecha
        } else {
            fecha = 'Sin fecha';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><button class="delete-btn" data-id="${unidad.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${unidad.id}</td>
            <td>${unidad.nombre}</td>
            <td>${unidad.usuario || 'No disponible'}</td>
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
            renderTable(unidades); // Actualizar la tabla al cambiar de página
            renderPagination(totalItems); // Actualizar los botones de paginación
        });
        paginationContainer.appendChild(pageButton);
    }
}

// Agregar evento al campo de búsqueda para filtrar los datos en tiempo real
buscarunidadInput.addEventListener('input', () => {
    currentPage = 1; // Resetear a la primera página al buscar
    renderTable(unidades);  // Actualizar la tabla con los datos filtrados
    renderPagination(unidades.length); // Actualizar la paginación
});

// Inicializar la tabla al cargar la página
getunidades();
