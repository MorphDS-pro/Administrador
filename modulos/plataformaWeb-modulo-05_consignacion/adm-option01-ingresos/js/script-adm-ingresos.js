// Importar los métodos necesarios de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

// Configuración de Firebase para el proyecto de consignaciones
const firebaseConfig2 = {
  apiKey: "AIzaSyDlOW1-vrW4uiXrveFPoBcJ1ImZlPqzzlA",
  authDomain: "consignaciones-ee423.firebaseapp.com",
  projectId: "consignaciones-ee423",
  storageBucket: "consignaciones-ee423.firebasestorage.app",
  messagingSenderId: "992838229253",
  appId: "1:992838229253:web:38462a4886e4ede6a7ab6c",
  measurementId: "G-K58BRH151H"
};

// Inicializar Firebase y Firestore para el proyecto de consignaciones
const app2 = initializeApp(firebaseConfig2);
const db2 = getFirestore(app2);
const auth = getAuth(app2);

document.addEventListener("DOMContentLoaded", async () => {
    const formRegisterContainer = document.getElementById("formRegisterContainer");
    const btnSave = document.getElementById("btnSave");
    const btnReset = document.getElementById("btnReset");
    const registerUsuario = document.getElementById("registerUsuario");
    const registerAdmission = document.getElementById("registerAdmission");
    const registerPatient = document.getElementById("registerPatient");
    const registerDoctor = document.getElementById("registerDoctor");
    const registerSurgeryDate = document.getElementById("registerSurgeryDate");
    const registerDescriptionInput = document.getElementById("registerDescriptionInput");
    const registerQuantity = document.getElementById("registerQuantity");
    const registerCompany = document.getElementById("registerCompany");
    const registerCode = document.getElementById("registerCode");
    const registerPrice = document.getElementById("registerPrice");
    const registerAttribute = document.getElementById("registerAttribute");
    const registerStatus = document.getElementById("registerStatus");
    const registerType = document.getElementById("registerType");

    // Obtener el nombre del usuario logueado
    const user = auth.currentUser;
    if (user) {
        registerUsuario.textContent = user.displayName || "Usuario no registrado";
    } else {
        registerUsuario.textContent = "Usuario no logueado";
    }

    // Obtener médicos para llenar el select de médicos
    const doctorSelect = registerDoctor;
    const doctorsSnapshot = await getDocs(collection(db2, "doctors"));
    doctorsSnapshot.forEach((doc) => {
        const doctor = doc.data();
        const option = document.createElement("option");
        option.value = doctor.name;  // Usamos el nombre del médico
        option.textContent = doctor.name;
        doctorSelect.appendChild(option);
    });

    // Generar ID incremental
    const generateIncrementalId = async () => {
        const q = query(collection(db2, "consignaciones"), orderBy("createdAt", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        let id = 1;
        if (!querySnapshot.empty) {
            const lastDoc = querySnapshot.docs[0];
            id = parseInt(lastDoc.id) + 1;
        }
        return id.toString().padStart(4, '0'); // Asegura que el ID tenga 4 dígitos
    };

    // Evento de guardado
    btnSave?.addEventListener("click", async (e) => {
        e.preventDefault();

        const newId = await generateIncrementalId(); // Generamos el ID incremental

        const data = {
            admission: registerAdmission.value.trim(),
            patientName: registerPatient.value.trim(),
            doctor: registerDoctor.value, // Ahora guardamos el nombre del médico, no el ID
            surgeryDate: registerSurgeryDate.value,
            description: registerDescriptionInput.value.trim(),
            quantity: parseInt(registerQuantity.value),
            company: registerCompany.value.trim(),
            code: registerCode.value.trim(),
            price: parseFloat(registerPrice.value),
            attribute: registerAttribute.value,
            status: registerStatus.value,
            type: registerType.value,
            createdAt: new Date(),
            user: registerUsuario.textContent,  // Nombre del usuario que realiza el registro
            id: newId // Agregar el ID incremental generado
        };

        try {
            // Guardar en Firebase Firestore (proyecto consignaciones)
            await addDoc(collection(db2, 'consignaciones'), data);
            console.log('Registro guardado correctamente');
            // Limpiar formulario después de guardar
            formRegisterContainer.reset();
        } catch (error) {
            console.error('Error al guardar el registro:', error);
        }
    });

    // Evento de reset
    btnReset?.addEventListener("click", () => {
        formRegisterContainer.reset();
    });
});
