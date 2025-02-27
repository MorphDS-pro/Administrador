import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js'; 
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  deleteDoc, doc, updateDoc, getDoc, getDocs 
} from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

import { getAuth } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';







export const firebaseConfigUsers = {
    apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
    authDomain: "prestaciones-57dcd.firebaseapp.com",
    projectId: "prestaciones-57dcd",
    storageBucket: "prestaciones-57dcd.firebasestorage.app",
    messagingSenderId: "409471759723",
    appId: "1:409471759723:web:faa6812772f44baa3ec82e",
    measurementId: "G-0CZ9BMJWMV"
};
  
export const firebaseConfigConsignaciones = {
    apiKey: "AIzaSyDlOW1-vrW4uiXrveFPoBcJ1ImZlPqzzlA",
    authDomain: "consignaciones-ee423.firebaseapp.com",
    projectId: "consignaciones-ee423",
    storageBucket: "consignaciones-ee423.firebasestorage.app",
    messagingSenderId: "992838229253",
    appId: "1:992838229253:web:38462a4886e4ede6a7ab6c",
    measurementId: "G-K58BRH151H"
};
  
let appUsers;
if (!getApps().some(app => app.name === 'usersApp')) {
  appUsers = initializeApp(firebaseConfigUsers, 'usersApp');
} else {
  appUsers = getApps().find(app => app.name === 'usersApp');
}
const dbUsers = getFirestore(appUsers);
const authUsers = getAuth(appUsers);
  
let appConsignaciones;
if (!getApps().some(app => app.name === 'consignacionesApp')) {
  appConsignaciones = initializeApp(firebaseConfigConsignaciones, 'consignacionesApp');
} else {
  appConsignaciones = getApps().find(app => app.name === 'consignacionesApp');
}
const dbConsignaciones = getFirestore(appConsignaciones);
  
async function guardarIngreso(event) {
  event.preventDefault();

  document.getElementById('overlayRegister').classList.remove('hidden');

  const usuario = document.getElementById('registerUsuario').textContent.trim();
  const admission = document.getElementById('registerAdmission').value;
  const patient = document.getElementById('registerPatient').value;
  const doctorSelect = document.getElementById('registerDoctor');
  const doctorId = doctorSelect.value;
  const doctorName = doctorSelect.options[doctorSelect.selectedIndex].text;
  const surgeryDate = document.getElementById('registerSurgeryDate').value;
  const description = document.getElementById('registerDescriptionInput').value;
  const quantity = document.getElementById('registerQuantity').value;
  const company = document.getElementById('registerCompany').value;
  const code = document.getElementById('registerCode').value;
  const price = document.getElementById('registerPrice').value;
  const attribute = document.getElementById('registerAttribute').value;
  const status = document.getElementById('registerStatus').value;
  const type = document.getElementById('registerType').value;
  const creationDate = new Date().toISOString();

  try {
      const ingresosCollection = collection(dbConsignaciones, 'ingresos');
      await addDoc(ingresosCollection, {
          usuario,
          admission,
          patient,
          doctorId,
          nombre: doctorName,
          surgeryDate,
          description,
          quantity,
          company,
          code,
          price,
          attribute,
          status,
          type,
          creationDate
      });

      document.getElementById('overlayRegister').classList.add('hidden');
      document.getElementById('successText').innerHTML = `Se ha registrado con éxito el paciente <strong>${patient}</strong> con el código <strong>${code}</strong> y la descripción <strong>${description}</strong>.`;
      document.getElementById('messageSuccess').classList.remove('hidden');

      setTimeout(() => {
          document.getElementById('messageSuccess').classList.add('hidden');
      }, 6000);

      document.getElementById('registerDescriptionInput').value = '';
      document.getElementById('registerQuantity').value = '';
      document.getElementById('registerCompany').value = '';
      document.getElementById('registerCode').value = '';
      document.getElementById('registerPrice').value = '';
  } catch (error) {
      console.error("Error al guardar el ingreso:", error);

      document.getElementById('overlayRegister').classList.add('hidden');
      document.getElementById('errorText').innerHTML = `Error al registrar el ingreso: ${error.message}`;
      document.getElementById('messageError').classList.remove('hidden');

      setTimeout(() => {
          document.getElementById('messageError').classList.add('hidden');
      }, 6000);
  }
}

document.getElementById('closeMessageSuccess').addEventListener('click', () => {
  document.getElementById('messageSuccess').classList.add('hidden');
});
document.getElementById('closeMessageError').addEventListener('click', () => {
  document.getElementById('messageError').classList.add('hidden');
});

const btnSave = document.getElementById('btnSave');
btnSave.addEventListener('click', guardarIngreso);

const tableBody = document.getElementById('table-body');
const ingresosCollection = collection(dbConsignaciones, 'ingresos');
onSnapshot(ingresosCollection, (snapshot) => {
  tableBody.innerHTML = ''; 
  snapshot.forEach((doc) => {
    const ingreso = doc.data();
    const docId = doc.id;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <i class="fas fa-trash-alt delete-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #e74c3c;"></i>
        <i class="fas fa-edit edit-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #4CAF50;"></i>
      </td>
      <td>${ingreso.admission}</td>
      <td>${ingreso.patient}</td>
      <td>${ingreso.nombre}</td>
      <td>${ingreso.surgeryDate}</td>
      <td>${ingreso.company}</td>
      <td>${ingreso.code}</td>
      <td>${ingreso.description}</td>
      <td>${ingreso.quantity}</td>
      <td>${ingreso.price}</td>
      <td>${ingreso.attribute}</td>
      <td>${ingreso.status}</td>
      <td>${ingreso.type}</td>
      <td>${ingreso.creationDate}</td>
      <td>${ingreso.usuario}</td>
    `;
    tableBody.appendChild(row);
  });
});

// ─── BLOQUE PARA ELIMINAR Y EDITAR ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("table-body");
  // Usamos dbConsignaciones ya inicializado
  const db = dbConsignaciones;
  let deleteId = null;
  let currentDocId = null; // Variable para guardar el ID del documento a editar

  // ── Manejador de Eliminación ─────────────────────────────────────────────
  tableBody.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-icon")) {
      deleteId = event.target.getAttribute("data-id");
      document.getElementById("confirmationDeleteContainerNew").classList.remove("hidden");
    }
  });

  // ── Confirmar Eliminación ────────────────────────────────────────────────
  document.getElementById("btnConfirmDeleteNew").addEventListener("click", async () => {
    if (deleteId) {
      document.getElementById("confirmationDeleteContainerNew").classList.add("hidden");
      document.getElementById("overlayDelete").classList.remove("hidden");

      try {
        await deleteDoc(doc(db, "ingresos", deleteId));
        document.getElementById("overlayDelete").classList.add("hidden");
        document.getElementById("messageSuccess").classList.remove("hidden");
        document.getElementById("successText").innerText = `Se ha eliminado el registro ${deleteId}`;
      } catch (error) {
        document.getElementById("overlayDelete").classList.add("hidden");
        document.getElementById("messageError").classList.remove("hidden");
        document.getElementById("errorText").innerText = `Error al eliminar: ${error.message}`;
      }
    }
  });

  // ── Cancelar Eliminación ─────────────────────────────────────────────────
  document.getElementById("btnCancelDeleteNew").addEventListener("click", () => {
    document.getElementById("confirmationDeleteContainerNew").classList.add("hidden");
  });

  // ── Manejador de Edición ──────────────────────────────────────────────────
  tableBody.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-icon")) {
      const docId = event.target.getAttribute("data-id");
      currentDocId = docId; // Guardamos el ID actual para usarlo luego en guardar cambios

      try {
        const docSnap = await getDoc(doc(db, "ingresos", docId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          document.getElementById("editModalTitle").innerText = `Editar: ${data.code}`;
          document.getElementById("editModalAdmisionInput").value = data.admission || "";
          document.getElementById("editModalPacienteInput").value = data.patient || "";
          document.getElementById("editModalCantInput").value = data.quantity || "";

          // Mostrar el modal agregando la clase "visible" (según tu CSS)
          document.getElementById("editModal").classList.add("visible");
          document.getElementById("editModalOverlay").classList.add("visible");

          // Asignamos el evento al botón de guardar cambios usando la variable currentDocId
          document.getElementById("saveChangesButton").onclick = async () => {
            const updatedData = {
              admission: document.getElementById("editModalAdmisionInput").value,
              patient: document.getElementById("editModalPacienteInput").value,
              quantity: document.getElementById("editModalCantInput").value
            };

            try {
              await updateDoc(doc(db, "ingresos", currentDocId), updatedData);
              // Ocultar el modal removiendo la clase "visible"
              document.getElementById("editModal").classList.remove("visible");
              document.getElementById("editModalOverlay").classList.remove("visible");
              document.getElementById("messageSuccess").classList.remove("hidden");
              document.getElementById("successText").innerText = `Se ha actualizado el registro ${currentDocId}`;
            } catch (error) {
              document.getElementById("messageError").classList.remove("hidden");
              document.getElementById("errorText").innerText = `Error al actualizar: ${error.message}`;
            }
          };
        }
      } catch (error) {
        document.getElementById("messageError").classList.remove("hidden");
        document.getElementById("errorText").innerText = `Error al obtener datos: ${error.message}`;
      }
    }
  });

  // ── Cerrar mensajes de éxito/error ─────────────────────────────────────────
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.add("hidden");
    });
  });

  // ── Actualización en tiempo real ──────────────────────────────────────────
  onSnapshot(collection(db, "ingresos"), (snapshot) => {
    tableBody.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const row = `
        <tr>
          <td>
            <i class="fas fa-trash-alt delete-icon" data-id="${docSnap.id}" style="margin-right: 10px; cursor: pointer; color: #e74c3c;"></i>
            <i class="fas fa-edit edit-icon" data-id="${docSnap.id}" style="margin-right: 10px; cursor: pointer; color: #4CAF50;"></i>
          </td>
          <td>${data.admission}</td>
          <td>${data.patient}</td>
          <td>${data.nombre}</td>
          <td>${data.surgeryDate}</td>
          <td>${data.company}</td>
          <td>${data.code}</td>
          <td>${data.description}</td>
          <td>${data.quantity}</td>
          <td>${data.price}</td>
          <td>${data.attribute}</td>
          <td>${data.status}</td>
          <td>${data.type}</td>
          <td>${data.creationDate}</td>
          <td>${data.usuario}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  });
});

// Cambiar entre las tablas y resaltar el botón activo
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabCodigos = document.getElementById('tabCodigos');
  const tabPendientes = document.getElementById('tabPendientes');
  const codigosTable = document.getElementById('codigosTable');
  const pendientesTable = document.getElementById('pendientesTable');

  function activateTab(activeButton, activeTable, inactiveTable) {
    // Ocultar la tabla inactiva y mostrar la activa
    activeTable.style.display = 'block';
    inactiveTable.style.display = 'none';

    // Remover la clase 'active' de todos los botones
    tabButtons.forEach(button => button.classList.remove('active'));

    // Agregar la clase 'active' al botón presionado
    activeButton.classList.add('active');
  }

  // Eventos para los botones
  tabCodigos.addEventListener('click', () => activateTab(tabCodigos, codigosTable, pendientesTable));
  tabPendientes.addEventListener('click', () => activateTab(tabPendientes, pendientesTable, codigosTable));
});

























// ------------------ EVENTO PARA TRASPASAR DATOS A "historial" ------------------

// Agrega un listener al botón "saveButton" (dentro de .save-container)
document.getElementById('saveButton').addEventListener('click', () => {
  // Obtenemos la fecha de hoy en formato local
  const today = new Date().toLocaleDateString();
  // Asignamos el mensaje de confirmación
  document.getElementById('transferConfirmationText').innerText = `¿Desea traspasar los datos y guardar con fecha: ${today}?`;
  // Mostramos el contenedor de confirmación
  document.getElementById('confirmationTransferContainer').classList.remove('hidden');
});

// Evento para cancelar el traspaso
document.getElementById('btnCancelTransfer').addEventListener('click', () => {
  document.getElementById('confirmationTransferContainer').classList.add('hidden');
});

// Evento para confirmar el traspaso
document.getElementById('btnConfirmTransfer').addEventListener('click', async () => {
  // Ocultamos el contenedor de confirmación
  document.getElementById('confirmationTransferContainer').classList.add('hidden');
  // Mostramos el spinner de importación
  document.getElementById('overlayImport').classList.remove('hidden');

  try {
    // Obtenemos todos los documentos de la colección "ingresos" de la base de datos de consignaciones
    const ingresosSnapshot = await getDocs(collection(dbConsignaciones, "ingresos"));
    const promises = [];

    ingresosSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Creamos el objeto para historial, agregando un campo extra "historialId" con el id original
      const historialData = { ...data, historialId: docSnap.id };
      // Primero, agregamos el documento a "historial"
      const p = addDoc(collection(dbConsignaciones, "historial"), historialData)
        .then(() => {
          // Luego, eliminamos el documento de "ingresos"
          return deleteDoc(doc(dbConsignaciones, "ingresos", docSnap.id));
        });
      promises.push(p);
    });

    // Esperamos a que se completen todas las operaciones
    await Promise.all(promises);

    // Ocultamos el spinner
    document.getElementById('overlayImport').classList.add('hidden');
    // Mostramos el mensaje de éxito
    document.getElementById('messageSuccess').classList.remove('hidden');
    document.getElementById('successText').innerText = `Se ha traspasado con éxito.`;
    // Cambiamos a la vista de la tabla de "historial" (pendientes)
    document.getElementById('codigosTable').style.display = 'none';
    document.getElementById('pendientesTable').style.display = 'block';
  } catch (error) {
    document.getElementById('overlayImport').classList.add('hidden');
    document.getElementById('messageError').classList.remove('hidden');
    document.getElementById('errorText').innerText = `Error al traspasar: ${error.message}`;
  }
});

// ------------------ ONSNAPSHOT PARA ACTUALIZAR LA TABLA DE "historial" ------------------
// ------------------ ONSNAPSHOT PARA ACTUALIZAR LA TABLA DE "historial" ------------------
onSnapshot(collection(dbConsignaciones, "historial"), (snapshot) => {
  const pendientesTableBody = document.getElementById('pendientesTableBody');
  pendientesTableBody.innerHTML = ""; // Limpiamos la tabla antes de llenarla

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = `
      <tr>
        <td>
          <i class="fas fa-trash-alt delete-icon" data-id="${docSnap.id}" style="margin-right: 10px; cursor: pointer; color: #e74c3c;"></i>
          <i class="fas fa-edit edit-icon" data-id="${docSnap.id}" style="margin-right: 10px; cursor: pointer; color: #4CAF50;"></i>
        </td>
        <td>${docSnap.id}</td>
        <td>${data.admission}</td>
        <td>${data.patient}</td>
        <td>${data.nombre}</td>
        <td>${data.surgeryDate}</td>
        <td>${data.company}</td>
        <td>${data.code}</td>
        <td>${data.description}</td>
        <td>${data.quantity}</td>
        <td>${data.price}</td>
        <td>${data.attribute}</td>
        <td>
            ${data.status}
            <i class="fas fa-pencil-alt edit-icon" data-id="${docSnap.id}" style="margin-left: 10px; cursor: pointer; color: #4CAF50;"></i>
        </td>
        <td>${data.type}</td>
        <td>${data.creationDate}</td>
        <td>${data.usuario}</td>
        <td>
          <i class="fas fa-eye view-icon" data-id="${docSnap.id}" style="margin-left: 10px; cursor: pointer; color: #3498db;"></i>
        </td>
      </tr>
    `;
    pendientesTableBody.innerHTML += row;
  });

  // Agregar listener para el icono de eliminar
  const deleteIcons = document.querySelectorAll('.delete-icon');
  deleteIcons.forEach(icon => {
    icon.addEventListener('click', async (event) => {
      const id = event.target.getAttribute('data-id');
      
      // Confirmar la eliminación
      const confirmation = confirm('¿Estás seguro de que deseas eliminar este registro?');
      
      if (confirmation) {
        try {
          // Eliminar el documento de la colección "historial"
          await deleteDoc(doc(dbConsignaciones, "historial", id));
          console.log('Documento eliminado con éxito');
        } catch (error) {
          console.error('Error al eliminar el documento:', error);
        }
      }
    });
  });
});
