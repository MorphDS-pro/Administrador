import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  startAfter, 
  startAt, 
  limit, 
  getDocs,
  doc,
  getDoc,
  where,
  updateDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfigHistorial = {
  apiKey: "AIzaSyDlOW1-vrW4uiXrveFPoBcJ1ImZlPqzzlA",
  authDomain: "consignaciones-ee423.firebaseapp.com",
  projectId: "consignaciones-ee423",
  storageBucket: "consignaciones-ee423.firebasestorage.app",
  messagingSenderId: "992838229253",
  appId: "1:992838229253:web:38462a4886e4ede6a7ab6c",
  measurementId: "G-K58BRH151H"
};

const firebaseConfigMedicos = {
  apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
  authDomain: "prestaciones-57dcd.firebaseapp.com",
  projectId: "prestaciones-57dcd",
  storageBucket: "prestaciones-57dcd.firebasestorage.app",
  messagingSenderId: "409471759723",
  appId: "1:409471759723:web:faa6812772f44baa3ec82e",
  measurementId: "G-0CZ9BMJWMV"
};

const firebaseConfigPlanilla = {
  apiKey: "AIzaSyDRpskUwmGXFrTggbUEEwG3_-5M6Sznq9Y",
  authDomain: "corporativo-3a3f2.firebaseapp.com",
  projectId: "corporativo-3a3f2",
  storageBucket: "corporativo-3a3f2.firebasestorage.app",
  messagingSenderId: "2416210110",
  appId: "1:2416210110:web:f3321faa969bf3d6ef2eef",
  measurementId: "G-J29C5HPX5C"
};

const appHistorial = initializeApp(firebaseConfigHistorial);
const dbHistorial = getFirestore(appHistorial);
const appMedicos = initializeApp(firebaseConfigMedicos, "medicosApp");
const dbMedicos = getFirestore(appMedicos);
const appPlanilla = initializeApp(firebaseConfigPlanilla, "planillaApp");
const dbPlanilla = getFirestore(appPlanilla);

const pageSize = 10;
let currentPage = 1;
let lastVisible = null; 
let pageCursors = [];

let cachedDocs = null;
let cachedDateFilters = {
  from: null,
  to: null,
  exact: null
};

const doctorCache = {};

let initialLoad = true;

function showSpinner() {
  const overlay = document.getElementById("overlayLoading");
  overlay.classList.remove("hidden");
}
function hideSpinner() {
  const overlay = document.getElementById("overlayLoading");
  overlay.classList.add("hidden");
}

const tableBody = document.getElementById("table-body");
const btnPrevious = document.getElementById("btnPrevious");
const btnNext = document.getElementById("btnNext");
const pageNumberSpan = document.getElementById("pageNumber");
const historialRef = collection(dbHistorial, "historial");
const searchSurgeryDateFrom = document.getElementById("searchSurgeryDateFrom");
const searchSurgeryDateTo   = document.getElementById("searchSurgeryDateTo");
const searchSurgeryDate     = document.getElementById("searchSurgeryDate");
const searchPatient         = document.getElementById("searchPatient");
const searchDoctor          = document.getElementById("searchDoctor");
const searchCompany         = document.getElementById("searchCompany");
const searchCode            = document.getElementById("searchCode");
const searchDescription     = document.getElementById("searchDescription");
const searchAdmission       = document.getElementById("searchAdmission");

async function loadPage(direction = "initial") {
  if (initialLoad) showSpinner();

  const textFiltersActive = 
    searchPatient.value ||
    searchDoctor.value ||
    searchCompany.value ||
    searchCode.value ||
    searchDescription.value ||
    searchAdmission.value;
  
  if (textFiltersActive) {
    const currentDateFilters = {
      from: searchSurgeryDateFrom.value,
      to: searchSurgeryDateTo.value,
      exact: searchSurgeryDate.value
    };
    
    if (
      !cachedDocs ||
      cachedDateFilters.from !== currentDateFilters.from ||
      cachedDateFilters.to !== currentDateFilters.to ||
      cachedDateFilters.exact !== currentDateFilters.exact
    ) {
      let q = query(historialRef);
      if (currentDateFilters.from) {
        q = query(q, where("surgeryDate", ">=", currentDateFilters.from));
      }
      if (currentDateFilters.to) {
        q = query(q, where("surgeryDate", "<=", currentDateFilters.to));
      }
      if (currentDateFilters.exact) {
        q = query(q, where("surgeryDate", "==", currentDateFilters.exact));
      }
      q = query(q, orderBy("surgeryDate", "asc"), orderBy("incrementalId", "asc"));
      
      const querySnapshot = await getDocs(q);
      cachedDocs = querySnapshot.docs;
      cachedDateFilters = { ...currentDateFilters };
    }
    
    const filteredDocs = cachedDocs.filter(docSnap => {
      const data = docSnap.data();
      if (searchPatient.value && !((data.patient || "").toLowerCase().includes(searchPatient.value.toLowerCase()))) return false;
      if (searchDoctor.value && !((data.doctorId || "").toLowerCase().includes(searchDoctor.value.toLowerCase()))) return false;
      if (searchCompany.value && !((data.company || "").toLowerCase().includes(searchCompany.value.toLowerCase()))) return false;
      if (searchCode.value && !((data.code || "").toLowerCase().includes(searchCode.value.toLowerCase()))) return false;
      if (searchDescription.value && !((data.description || "").toLowerCase().includes(searchDescription.value.toLowerCase()))) return false;
      if (searchAdmission.value && !((data.admission || "").toLowerCase().includes(searchAdmission.value.toLowerCase()))) return false;
      return true;
    });
    
    filteredDocs.sort((a, b) => {
      const idA = a.data().incrementalId || a.id;
      const idB = b.data().incrementalId || b.id;
      return idA.toString().localeCompare(idB.toString(), undefined, { numeric: true });
    });
    
    const totalFiltered = filteredDocs.length;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const docsPage = filteredDocs.slice(startIndex, endIndex);
    
    tableBody.innerHTML = "";
    if (docsPage.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="16">No se encontraron registros.</td></tr>`;
    } else {
      for (const docSnap of docsPage) {
        const data = docSnap.data();
        let doctorName = "";
        if (doctorCache[data.doctorId]) {
          doctorName = doctorCache[data.doctorId];
        } else {
          try {
            const medicoDocRef = doc(dbMedicos, "medicos", data.doctorId);
            const medicoDocSnap = await getDoc(medicoDocRef);
            doctorName = medicoDocSnap.exists() ? medicoDocSnap.data().nombre : data.doctorId;
            doctorCache[data.doctorId] = doctorName;
          } catch (error) {
            console.error("Error al obtener nombre del médico:", error);
            doctorName = data.doctorId;
          }
        }
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <i class="fas fa-edit edit-icon" style="cursor:pointer;" title="Editar" onclick="editRecord('${docSnap.id}')"></i>
            <i class="fas fa-trash delete-icon" style="cursor:pointer;" title="Eliminar" onclick="deleteRecord('${docSnap.id}')"></i>
          </td>
          <td>${data.incrementalId || docSnap.id}</td>
          <td>${data.admission || ""}</td>
          <td>${data.patient || ""}</td>
          <td>${doctorName}</td>
          <td>${data.surgeryDate || ""}</td>
          <td>${data.company || ""}</td>
          <td>${data.code || ""}</td>
          <td>${data.description || ""}</td>
          <td>${data.quantity || ""}</td>
          <td>${data.price || ""}</td>
          <td>${data.attribute || ""}</td>
          <td>${data.status || ""}</td>
          <td>${data.type || ""}</td>
          <td>${data.oc || ""}</td>
          <td>${data.factura || ""}</td>
          <td>${data.guia || ""}</td>
          <td>${data.cadena || ""}</td>
          <td>${data.creationDate || ""}</td>
          <td>${data.usuario || ""}</td>
        `;
        tableBody.appendChild(row);
      }
    }
    
    const totalPages = Math.ceil(totalFiltered / pageSize);
    pageNumberSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    btnPrevious.disabled = currentPage <= 1;
    btnNext.disabled = currentPage >= totalPages;
    
  } else {
    let q = query(historialRef);
    if (searchSurgeryDateFrom.value) {
      q = query(q, where("surgeryDate", ">=", searchSurgeryDateFrom.value));
    }
    if (searchSurgeryDateTo.value) {
      q = query(q, where("surgeryDate", "<=", searchSurgeryDateTo.value));
    }
    if (searchSurgeryDate.value) {
      q = query(q, where("surgeryDate", "==", searchSurgeryDate.value));
    }
    
    if (direction === "next" && lastVisible) {
      q = query(q, orderBy("surgeryDate", "asc"), orderBy("incrementalId", "asc"), startAfter(lastVisible), limit(pageSize));
    } else if (direction === "previous") {
      const previousCursor = pageCursors[currentPage - 1];
      if (previousCursor) {
        q = query(q, orderBy("surgeryDate", "asc"), orderBy("incrementalId", "asc"), startAt(previousCursor), limit(pageSize));
      } else {
        q = query(q, orderBy("surgeryDate", "asc"), orderBy("incrementalId", "asc"), limit(pageSize));
      }
    } else {
      q = query(q, orderBy("surgeryDate", "asc"), orderBy("incrementalId", "asc"), limit(pageSize));
    }
    
    try {
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty && direction === "next") {
        console.warn("No hay más registros para mostrar.");
        currentPage--;
        return;
      }
      
      let docsArray = querySnapshot.docs;
      docsArray.sort((a, b) => {
        const idA = a.data().incrementalId || a.id;
        const idB = b.data().incrementalId || b.id;
        return idA.toString().localeCompare(idB.toString(), undefined, { numeric: true });
      });
      
      if (docsArray.length > 0) {
        pageCursors[currentPage - 1] = docsArray[0];
        lastVisible = docsArray[docsArray.length - 1];
      } else {
        lastVisible = null;
      }
      
      tableBody.innerHTML = "";
      if (docsArray.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="16">No se encontraron registros.</td></tr>`;
      } else {
        for (const docSnap of docsArray) {
          const data = docSnap.data();
          let doctorName = "";
          if (doctorCache[data.doctorId]) {
            doctorName = doctorCache[data.doctorId];
          } else {
            try {
              const medicoDocRef = doc(dbMedicos, "medicos", data.doctorId);
              const medicoDocSnap = await getDoc(medicoDocRef);
              doctorName = medicoDocSnap.exists() ? medicoDocSnap.data().nombre : data.doctorId;
              doctorCache[data.doctorId] = doctorName;
            } catch (error) {
              console.error("Error al obtener nombre del médico:", error);
              doctorName = data.doctorId;
            }
          }
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>
              <i class="fas fa-edit edit-icon" style="cursor:pointer;" title="Editar" onclick="editRecord('${docSnap.id}')"></i>
              <i class="fas fa-trash delete-icon" style="cursor:pointer;" title="Eliminar" onclick="deleteRecord('${docSnap.id}')"></i>
            </td>
            <td>${data.incrementalId || docSnap.id}</td>
            <td>${data.admission || ""}</td>
            <td>${data.patient || ""}</td>
            <td>${doctorName}</td>
            <td>${data.surgeryDate || ""}</td>
            <td>${data.company || ""}</td>
            <td>${data.code || ""}</td>
            <td>${data.description || ""}</td>
            <td>${data.quantity || ""}</td>
            <td>${data.price || ""}</td>
            <td>${data.attribute || ""}</td>
            <td>${data.status || ""}</td>
            <td>${data.type || ""}</td>
            <td>${data.oc || ""}</td>
            <td>${data.factura || ""}</td>
            <td>${data.guia || ""}</td>   
            <td>${data.cadena || ""}</td>               
            <td>${data.creationDate || ""}</td>
            <td>${data.usuario || ""}</td>
          `;
          tableBody.appendChild(row);
        }
      }
      
      pageNumberSpan.textContent = `Página ${currentPage}`;
      btnPrevious.disabled = (currentPage <= 1);
      btnNext.disabled = (docsArray.length < pageSize);
      
    } catch (error) {
      console.error("Error al cargar los registros:", error);
    }
  }
  
  if (initialLoad) {
    hideSpinner();
    initialLoad = false;
  }
}

async function syncWithPlanilla() {
  showSpinner();

  try {
    const planillaSnapshot = await getDocs(collection(dbPlanilla, "implantes"));
    const planillaMap = new Map();

    planillaSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const cadena = `${data.ID_PACIENTE || ""}${data.CODIGO_CLINICA || ""}`;
      if (cadena) {
        planillaMap.set(cadena, {
          oc: data.OC || "",
          guia: data.NUMERO_GUIA || "", 
          factura: data.NUMERO_FACTURA || ""
        });
      }
    });

    const historialSnapshot = await getDocs(collection(dbHistorial, "historial"));
    const batch = writeBatch(dbHistorial);
    let updatesCount = 0;

    historialSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const cadena = `${data.admission || ""}${data.code || ""}`;
      const planillaData = planillaMap.get(cadena);

      if (planillaData && (data.oc !== planillaData.oc || data.guia !== planillaData.guia || data.factura !== planillaData.factura)) {
        const docRef = doc(dbHistorial, "historial", docSnap.id);
        batch.update(docRef, {
          oc: planillaData.oc,
          guia: planillaData.guia,
          factura: planillaData.factura 
        });
        updatesCount++;
      }
    });

    if (updatesCount > 0) {
      await batch.commit();
      showMessage("success", `Se actualizaron ${updatesCount} registros con datos de Planilla.`);
    } else {
      showMessage("info", "No se encontraron coincidencias para actualizar.");
    }

    await loadPage();

  } catch (error) {
    console.error("Error al sincronizar con Planilla:", error);
    showMessage("error", "Ocurrió un error al sincronizar los datos.");
  } finally {
    hideSpinner();
  }
}

function showMessage(type, text) {
  const messageContainer = document.getElementById(`message${type.charAt(0).toUpperCase() + type.slice(1)}`);
  const textElement = document.getElementById(`${type}Text`);
  textElement.textContent = text;
  messageContainer.classList.remove("hidden");
  setTimeout(() => messageContainer.classList.add("hidden"), 5000);
}

let debounceTimer;
const searchInputs = [
  searchSurgeryDateFrom,
  searchSurgeryDateTo,
  searchSurgeryDate,
  searchPatient,
  searchDoctor,
  searchCompany,
  searchCode,
  searchDescription,
  searchAdmission
];
searchInputs.forEach(input => {
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentPage = 1;
      pageCursors = [];
      lastVisible = null;
      loadPage();
    }, 300);
  });
});

btnNext.addEventListener("click", async () => {
  currentPage++;
  await loadPage("next");
});
btnPrevious.addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    await loadPage("previous");
  }
});

window.editRecord = function(id) {
};
window.deleteRecord = function(id) {
};

document.addEventListener("DOMContentLoaded", function() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(function(input) {
      input.addEventListener('focus', function() {
          this.showPicker(); 
      });
  });
  document.getElementById("btnSync").addEventListener("click", syncWithPlanilla);
});

loadPage();