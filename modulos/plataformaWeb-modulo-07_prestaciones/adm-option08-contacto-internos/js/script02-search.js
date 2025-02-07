import { db } from './script01-firebase.js';
import { collection, getDocs, deleteDoc, doc, query, where, onSnapshot, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const searchCompanyInput = document.getElementById('searchCompany');
const searchRepresentativeInput = document.getElementById('searchRepresentative');
const tableBody = document.getElementById('table-body');
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

// Evento para cerrar el contenedor de confirmación (si tienes un botón de cierre)
const closeConfirmationDeleteNew = document.getElementById('closeConfirmationDeleteNew');
if(closeConfirmationDeleteNew){
  closeConfirmationDeleteNew.addEventListener('click', () => {
    confirmationDeleteContainerNew.classList.add('hidden');
  });
}

// Eventos para filtrar en tiempo real
searchCompanyInput.addEventListener('input', () => {
  currentPage = 1; // Reiniciamos la página al filtrar
  getContacts(searchCompanyInput.value, searchRepresentativeInput.value);
});

searchRepresentativeInput.addEventListener('input', () => {
  currentPage = 1;
  getContacts(searchCompanyInput.value, searchRepresentativeInput.value);
});

// Función para mostrar mensajes (éxito o error)
function showMessage(element, textElement, message) {
  textElement.textContent = message;
  element.classList.remove('hidden');
  setTimeout(() => element.classList.add('hidden'), 5000);
}

// Función para mostrar el spinner de eliminación
function showDeleteSpinner() {
  overlayDelete.classList.remove('hidden');
  spinnerContainerDelete.classList.remove('hidden');
  spinnerDelete.classList.remove('hidden');
  loadingTextDelete.classList.remove('hidden');
}

// Función para ocultar el spinner de eliminación
function hideDeleteSpinner() {
  overlayDelete.classList.add('hidden');
  spinnerContainerDelete.classList.add('hidden');
  spinnerDelete.classList.add('hidden');
  loadingTextDelete.classList.add('hidden');
}

// Obtener el nombre de la empresa a partir de su ID
async function getCompanyName(companyId) {
  if (!companyId) return 'No disponible';
  try {
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    if (companyDoc.exists()) {
      const companyData = companyDoc.data();
      return companyData.empresa || 'No disponible';
    }
    return 'No disponible';
  } catch (error) {
    console.error('Error al obtener el nombre de la empresa:', error);
    return 'No disponible';
  }
}

// Función para añadir una fila a la tabla
async function addRowToTable(id, companyNameValue, representante, correo, celular, anexo, cargo, observacion, fechaCreacion, usuarioDigitado, docId) {
  const row = document.createElement('tr');
  row.innerHTML = `        
      <td><i class="fas fa-trash-alt delete-icon" data-id="${docId}"></i></td>
      <td>${id}</td>
      <td>${companyNameValue}</td>
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
  deleteIcon.addEventListener('click', () => showDeleteConfirmation(docId, companyNameValue, row));
}

// Función para mostrar la confirmación de eliminación
function showDeleteConfirmation(docId, companyNameValue, row) {
  confirmationDeleteContainerNew.classList.remove('hidden');
  // Al confirmar o cancelar, se oculta el contenedor de confirmación
  btnConfirmDeleteNew.onclick = () => {
    deleteContact(docId, companyNameValue, row);
    confirmationDeleteContainerNew.classList.add('hidden');
  };
  btnCancelDeleteNew.onclick = () => {
    confirmationDeleteContainerNew.classList.add('hidden');
  };
}

// Función para eliminar un contacto
async function deleteContact(docId, companyNameValue, row) {
  const docRef = doc(db, 'internos', docId);
  try {
    showDeleteSpinner();
    await deleteDoc(docRef);
    hideDeleteSpinner();
    showMessage(messageSuccess, successText, `El contacto de ${companyNameValue} ha sido eliminado con éxito`);
    row.remove();
    getContacts(searchCompanyInput.value, searchRepresentativeInput.value);
  } catch (error) {
    hideDeleteSpinner();
    showMessage(messageError, errorText, `Ocurrió un error al eliminar el contacto: ${error.message}`);
  }
}

// Función para obtener los contactos y filtrarlos
async function getContacts(companyQuery = '', representativeQuery = '') {
  const contactsRef = collection(db, 'internos');

  try {
    const snapshot = await getDocs(contactsRef);
    tableBody.innerHTML = ''; // Limpiar la tabla

    const contacts = [];
    snapshot.forEach(docSnap => {
      const contact = docSnap.data();
      // Usamos el campo "nombre" para la empresa, según se registró en register.js
      const companyNameLower = contact.nombre ? contact.nombre.toLowerCase() : '';
      const representativeLower = contact.representante ? contact.representante.toLowerCase() : '';
      const companyQueryLower = companyQuery.toLowerCase();
      const representativeQueryLower = representativeQuery.toLowerCase();

      if (companyNameLower.includes(companyQueryLower) && representativeLower.includes(representativeQueryLower)) {
        contacts.push({ ...contact, docId: docSnap.id });
      }
    });

    totalPages = Math.ceil(contacts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

    currentPageContacts.forEach(contact => {
      // Se usa contact.nombre directamente, ya que contiene el nombre de la empresa
      addRowToTable(contact.id, contact.nombre, contact.representante, contact.correo, contact.celular, contact.anexo, contact.cargo, contact.observacion, contact.fechaCreacion, contact.registradoPor, contact.docId);
    });

    pageNumber.textContent = `Página ${currentPage} de ${totalPages}`;
  } catch (error) {
    console.error('Error al obtener los contactos: ', error);
  }
}

// Llamada inicial para cargar los contactos (sin filtros)
getContacts();
