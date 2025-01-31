import { db } from './S01-Firebase.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables de DOM
const tableBody = document.getElementById('table-body');
const pendingCodesBody = document.getElementById('pending-codes-body');

// Función para mostrar los datos en las tablas
async function fetchData() {
    try {
        // Obtener todos los registros de la colección 'codigos'
        const codigosSnapshot = await getDocs(collection(db, 'codigos'));
        const codigosData = [];

        codigosSnapshot.forEach((doc) => {
            const data = doc.data();
            codigosData.push({ id: doc.id, ...data });
        });

        // Mostrar todos los registros en la primera tabla
        displayData(tableBody, codigosData);

        // Filtrar los registros con "Sin código" y mostrarlos en la segunda tabla
        const pendingCodes = codigosData.filter(codigo => codigo.code === "Sin código");
        displayData(pendingCodesBody, pendingCodes);

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para mostrar los datos en la tabla
// Función para mostrar los datos en la tabla
function displayData(table, data) {
    table.innerHTML = '';  // Limpiar la tabla antes de llenarla con nuevos datos

    data.forEach(item => {
        const row = document.createElement('tr');

        // Crear celdas para cada campo
        const actionCell = document.createElement('td');
        // Crear el icono de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';  // Icono de eliminar
        deleteButton.classList.add('delete-btn');  // Agregar una clase para estilizar el botón (opcional)
        deleteButton.onclick = () => deleteRecord(item.id);  // Llamar a la función de eliminar cuando se hace clic
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        const idCell = document.createElement('td');
        idCell.textContent = item.id;
        row.appendChild(idCell);

        const referenceCell = document.createElement('td');
        referenceCell.textContent = item.reference;
        row.appendChild(referenceCell);

        const detailsCell = document.createElement('td');
        detailsCell.textContent = item.details;
        row.appendChild(detailsCell);

        const costCell = document.createElement('td');
        costCell.textContent = item.cost;
        row.appendChild(costCell);

        const codeCell = document.createElement('td');
        codeCell.textContent = item.code;
        row.appendChild(codeCell);

        const clinicCell = document.createElement('td');
        clinicCell.textContent = item.clinic;
        row.appendChild(clinicCell);

        const providerCell = document.createElement('td');
        providerCell.textContent = item.empresa;
        row.appendChild(providerCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.description;
        row.appendChild(descriptionCell);

        const atributeCell = document.createElement('td');
        atributeCell.textContent = item.atribute;
        row.appendChild(atributeCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = item.price;
        row.appendChild(priceCell);

        const classificationCell = document.createElement('td');
        classificationCell.textContent = item.classification;
        row.appendChild(classificationCell);

        const createdAtCell = document.createElement('td');
        createdAtCell.textContent = new Date(item.createdAt.seconds * 1000).toLocaleString();  // Formatear la fecha
        row.appendChild(createdAtCell);

        const userCell = document.createElement('td');
        userCell.textContent = item.usuario;
        row.appendChild(userCell);

        // Agregar la fila a la tabla
        table.appendChild(row);
    });
}

// Función para eliminar un registro
async function deleteRecord(recordId) {
    try {
        const recordRef = doc(db, 'codigos', recordId);
        await deleteDoc(recordRef);
        console.log('Registro eliminado:', recordId);
        // Recargar los datos después de eliminar
        fetchData();  // Puedes actualizar las tablas después de eliminar
    } catch (error) {
        console.error('Error al eliminar el registro:', error);
    }
}


// Ejecutar la función para cargar los datos cuando la página se cargue
fetchData();

// Función para mostrar y ocultar las pestañas
function showTab(tab) {
    const databaseTab = document.getElementById('tab-database-content');
    const pendingCodesTab = document.getElementById('tab-pending-codes-content');

    if (tab === 'database') {
        databaseTab.style.display = 'block';
        pendingCodesTab.style.display = 'none';
    } else {
        databaseTab.style.display = 'none';
        pendingCodesTab.style.display = 'block';
    }
}
