// Importar las funciones necesarias desde firebase.js
import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables del DOM
const buscarPrevisionInput = document.getElementById('buscarPrevision');
const tableBody = document.getElementById('table-body');

// Variable global para almacenar las previsiones
let previsiones = [];

// Función para obtener todas las previsiones de la base de datos
async function getPrevisiones() {
    try {
        const querySnapshot = await getDocs(collection(db, 'previsiones'));
        previsiones = []; // Limpiar la variable antes de llenarla con nuevos datos
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            previsiones.push({
                ...data,
                docId: doc.id, // Agregar el id del documento para referencia
            });
        });
        renderTable(previsiones); // Llamamos a la función de renderizado con los datos obtenidos
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para filtrar los datos según el campo de búsqueda
function filterData() {
    const previsionFilter = buscarPrevisionInput.value.trim().toLowerCase();

    // Filtrar las previsiones según el valor de búsqueda
    return previsiones.filter(prevision =>
        prevision.prevision.toLowerCase().includes(previsionFilter)
    );
}

// Función para renderizar la tabla con los datos filtrados
function renderTable(previsiones) {
    tableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    previsiones.forEach(prevision => {
        let fecha;
        if (prevision.fecha) {
            fecha = new Date(prevision.fecha.seconds * 1000).toLocaleDateString('es-CL'); // Convertir el timestamp a fecha
        } else {
            fecha = 'Sin fecha';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><button class="delete-btn" data-id="${prevision.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${prevision.id}</td>
            <td>${prevision.prevision}</td>
            <td>${fecha}</td>
            <td>${prevision.usuario || 'No disponible'}</td>
        `;
        tableBody.appendChild(row);

        // Agregar evento al botón de eliminar
        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => confirmDelete(prevision.docId, prevision.prevision));
    });
}

// Función para confirmar y eliminar una previsión
function confirmDelete(docId, previsionName) {
    if (confirm(`¿Estás seguro de que deseas eliminar la previsión "${previsionName}"?`)) {
        deletePrevision(docId, previsionName);
    }
}

// Función para eliminar una previsión de la base de datos
async function deletePrevision(docId, previsionName) {
    try {
        await deleteDoc(doc(db, 'previsiones', docId));
        alert(`La previsión "${previsionName}" ha sido eliminada con éxito.`);
        getPrevisiones(); // Recargar las previsiones después de eliminar
    } catch (error) {
        console.error('Error al eliminar la previsión:', error);
        alert('Error al eliminar la previsión. Intenta nuevamente.');
    }
}

// Agregar eventos al campo de búsqueda para filtrar los datos en tiempo real
buscarPrevisionInput.addEventListener('input', () => {
    const filteredPrevisiones = filterData(); // Filtrar usando los datos almacenados
    renderTable(filteredPrevisiones); // Actualizar la tabla con los datos filtrados
});

// Inicializar la tabla al cargar la página
getPrevisiones();
