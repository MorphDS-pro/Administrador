import { db } from './script01-firebase.js';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const searchCompanyInput = document.getElementById('searchCompany');
const searchRepresentativeInput = document.getElementById('searchRepresentative');
const tableBody = document.getElementById('table-body');
const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const pageNumber = document.getElementById('pageNumber');
let currentPage = 1;
const itemsPerPage = 20;
let totalPages = 1;

const confirmationDeleteContainerNew = document.getElementById('confirmationDeleteContainerNew');
const btnConfirmDeleteNew = document.getElementById('btnConfirmDeleteNew');
const btnCancelDeleteNew = document.getElementById('btnCancelDeleteNew');
const overlayDelete = document.getElementById('overlayDelete');
const spinnerContainerDelete = document.getElementById('spinnerContainerDelete');
const spinnerDelete = document.getElementById('spinnerDelete');
const loadingTextDelete = document.getElementById('loadingTextDelete');
const messageSuccess = document.getElementById('messageSuccess');
const successText = document.getElementById('successText');
const messageError = document.getElementById('messageError');
const errorText = document.getElementById('errorText');

// Obtén la empresa directamente con el id de la empresa
async function getCompanyName(companyId) {
    try {
        if (!companyId) return 'Nombre no disponible';

        console.log(`Buscando empresa con ID: ${companyId}`); // Log para depuración

        const companyRef = doc(db, 'companies', companyId);
        const companyDoc = await getDoc(companyRef);

        if (companyDoc.exists()) {
            const companyData = companyDoc.data();
            console.log('Datos de la empresa:', companyData); // Log para verificar los datos de la empresa
            return companyData.empresa || 'Nombre no disponible'; // Verifica si existe el campo 'empresa'
        } else {
            console.log(`No se encontró el documento para el ID: ${companyId}`);
            return 'Nombre no disponible';
        }
    } catch (error) {
        console.error('Error al obtener el nombre de la empresa:', error);
        return 'Nombre no disponible';
    }
}

// Añadir fila a la tabla
async function addRowToTable(id, empresa, representante, correo, celular, anexo, cargo, observacion, fechaCreacion, usuarioDigitado, docId) {
    const row = document.createElement('tr');
    
    // Esperamos a obtener el nombre de la empresa antes de agregar la fila
    const companyName = await getCompanyName(empresa); // Asegúrate de que empresa es el id de la compañía
    
    row.innerHTML = `        
        <td><i class="fas fa-trash-alt delete-icon" data-id="${docId}"></i></td>
        <td>${id}</td>
        <td>${companyName}</td> <!-- Aquí mostramos el nombre de la empresa -->
        <td>${representante || 'No disponible'}</td>
        <td>${correo || 'No disponible'}</td>
        <td>${celular || 'No disponible'}</td>
        <td>${anexo || 'No disponible'}</td>
        <td>${cargo || 'No disponible'}</td>
        <td>${observacion || 'No disponible'}</td>
        <td>${fechaCreacion}</td>
        <td>${usuarioDigitado}</td>
    `;
    tableBody.appendChild(row);

    const deleteIcon = row.querySelector('.delete-icon');
    deleteIcon.addEventListener('click', () => showDeleteConfirmation(docId, companyName, row));
}

// Función para mostrar la confirmación de eliminación
function showDeleteConfirmation(docId, empresa, row) {
    confirmationDeleteContainerNew.classList.remove('hidden');
    btnConfirmDeleteNew.onclick = () => deleteContact(docId, empresa, row);
    btnCancelDeleteNew.onclick = () => confirmationDeleteContainerNew.classList.add('hidden');
}

// Eliminar contacto
async function deleteContact(docId, empresa, row) {
    try {
        confirmationDeleteContainerNew.classList.add('hidden');
        showDeleteSpinner();

        const docRef = doc(db, 'contacts', docId);
        await deleteDoc(docRef);

        hideDeleteSpinner();
        showMessage(messageSuccess, successText, `El contacto ${empresa} ha sido eliminado con éxito`);

        getContacts(searchCompanyInput.value, searchRepresentativeInput.value);
        row.remove();
    } catch (error) {
        hideDeleteSpinner();
        showMessage(messageError, errorText, `Ocurrió un error al eliminar el contacto: ${error.message}`);
    }
}

function showDeleteSpinner() {
    overlayDelete.classList.remove('hidden');
    spinnerContainerDelete.classList.remove('hidden');
    spinnerDelete.classList.remove('hidden');
    loadingTextDelete.classList.remove('hidden');
}

function hideDeleteSpinner() {
    overlayDelete.classList.add('hidden');
    spinnerContainerDelete.classList.add('hidden');
    spinnerDelete.classList.add('hidden');
    loadingTextDelete.classList.add('hidden');
}

function showMessage(element, textElement, message) {
    textElement.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => element.classList.add('hidden'), 5000);
}