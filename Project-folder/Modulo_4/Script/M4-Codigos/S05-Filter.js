// Importar las funciones necesarias desde firebase.js
import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables del DOM
const buscarEmpresaInput = document.getElementById('buscarEmpresa');
const buscarRutInput = document.getElementById('buscarRut');
const tableBody = document.getElementById('table-body');

// Variable global para almacenar las empresas
let empresas = [];

// Función para obtener todas las empresas de la base de datos
async function getEmpresas() {
    try {
        const querySnapshot = await getDocs(collection(db, 'empresas'));
        empresas = []; // Limpiar la variable de empresas antes de llenarla con nuevos datos
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            empresas.push({
                ...data,
                docId: doc.id, // Agregar el id del documento para referencia
            });
        });
        renderTable(empresas);  // Llamamos a la función de renderizado con los datos obtenidos
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para filtrar los datos según los campos de búsqueda
function filterData() {
    const empresaFilter = buscarEmpresaInput.value.trim().toLowerCase();
    const rutFilter = buscarRutInput.value.trim().toLowerCase();

    // Filtrar las empresas según los valores de búsqueda
    return empresas.filter(empresa => {
        const matchEmpresa = empresa.empresa.toLowerCase().includes(empresaFilter);
        const matchRut = empresa.rut.toLowerCase().includes(rutFilter);
        return matchEmpresa && matchRut; // Mostrar solo las empresas que coincidan con ambos filtros
    });
}

// Función para renderizar la tabla con los datos filtrados
function renderTable(empresas) {
    tableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    empresas.forEach(empresa => {
        let fecha;
        if (empresa.fecha) {
            fecha = new Date(empresa.fecha.seconds * 1000).toLocaleDateString('es-CL'); // Convertir el timestamp a fecha
        } else {
            fecha = 'Sin fecha';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><button class="delete-btn" data-id="${empresa.docId}"><i class="fas fa-trash"></i></button></td>
            <td>${empresa.id}</td>
            <td>${empresa.empresa}</td>
            <td>${empresa.rut}</td>
            <td>${fecha}</td>
            <td>${empresa.usuario || 'No disponible'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Agregar eventos a los campos de búsqueda para filtrar los datos en tiempo real
buscarEmpresaInput.addEventListener('input', () => {
    const filteredEmpresas = filterData();  // Filtrar usando los datos almacenados
    renderTable(filteredEmpresas);  // Actualizar la tabla con los datos filtrados
});

buscarRutInput.addEventListener('input', () => {
    const filteredEmpresas = filterData();  // Filtrar usando los datos almacenados
    renderTable(filteredEmpresas);  // Actualizar la tabla con los datos filtrados
});

// Inicializar la tabla al cargar la página
getEmpresas();
