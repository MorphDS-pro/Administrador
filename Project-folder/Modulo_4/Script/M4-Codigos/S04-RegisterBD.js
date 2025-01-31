import { db, auth } from './S01-Firebase.js';
import { collection, addDoc, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Variables del DOM
const formRegisterContainer = document.getElementById('formRegisterContainer');
const overlay = document.getElementById('overlay');
const messagesContainer = document.getElementById('messagesContainer');
const btnSave = document.getElementById('btnSave');

// Función para generar un ID correlativo
async function getNextId() {
    const codigosSnapshot = await getDocs(collection(db, 'codigos'));
    let maxId = 0;

    codigosSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id) {
            const docId = parseInt(data.id, 10);
            if (!isNaN(docId) && docId > maxId) {
                maxId = docId;
            }
        }
    });

    return (maxId + 1).toString().padStart(3, '0'); // ID correlativo
}

// Mostrar mensaje de éxito o error
function showMessage(type, message) {
    const messageElement = document.getElementById(`message${capitalize(type)}`);
    const messageText = document.getElementById(`${type}Text`);
    messageText.textContent = message;
    messageElement.classList.remove('hidden');

    const closeButton = document.getElementById(`closeMessage${capitalize(type)}`);
    closeButton.onclick = () => {
        messageElement.classList.add('hidden');
    };
}

// Función para capitalizar la primera letra de una cadena
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para mostrar/ocultar spinner con mensaje dinámico
function showSpinner(show, message = "Cargando...") {
    overlay.classList.toggle('hidden', !show); // Mostrar u ocultar el spinner

    // Establecer el mensaje en el spinner
    const loadingText = document.getElementById('loadingText');  // Asegúrate de que 'loadingText' sea el id correcto
    if (loadingText) {
        loadingText.textContent = message; // Asigna el mensaje recibido como argumento
    } else {
        console.error('Elemento loadingText no encontrado');
    }
}

// Evento para guardar código
btnSave.onclick = async (e) => {
    e.preventDefault();
    showSpinner(true, "Registrando..."); // Mostrar el spinner con mensaje "Registrando..."

    // Obtener los valores del formulario
    const reference = document.getElementById('registerReference').value;
    const details = document.getElementById('registerDetails').value;
    const cost = document.getElementById('registerCost').value;
    const code = document.getElementById('registerCode').value || 'Sin código';  // Código no obligatorio
    const provider = document.getElementById('registerProvider').value;
    
    // Obtener los valores de los spans (concatenaciones y valores dinámicos)
    const description = document.getElementById('registerDescription').textContent || 'No disponible';  // Si el span está vacío, asignar "No disponible"
    const price = document.getElementById('registerPrice').textContent || '0';  // Si el span está vacío, asignar "0"
    const atribute = document.getElementById('atribute').textContent || 'IMPLANTES';  // Valor por defecto si está vacío
    const classification = document.getElementById('registerClassification').value;
    const usuario = document.getElementById('registerUsuario').textContent.trim() || (auth.currentUser ? auth.currentUser.email : 'Anónimo');

    // Obtener el valor del campo 'Clínica' desde el span
    const clinic = document.getElementById('registerClinic').textContent || 'LIRCAY';  // Valor por defecto si está vacío

    // Obtener el ID de la empresa seleccionada
    const empresaId = document.getElementById('registerProvider').value;  // ID de la empresa seleccionada
    if (!empresaId) {
        showMessage('error', 'Por favor, selecciona una empresa.');
        return;
    }

    console.log('empresaId:', empresaId);  // Verificar el ID seleccionado

    // Buscar el nombre de la empresa en Firestore
    let empresaNombre = '';
    try {
        const empresaDoc = await getDoc(doc(db, 'empresas', empresaId));  // Buscar documento de empresa
        if (empresaDoc.exists()) {
            empresaNombre = empresaDoc.data().empresa;  // Guardar el nombre de la empresa
            console.log('Empresa encontrada:', empresaNombre);  // Mostrar nombre de la empresa
        } else {
            console.error('No se encontró la empresa con el ID:', empresaId);
            showMessage('error', 'No se encontró la empresa seleccionada.');
            return;
        }
    } catch (error) {
        console.error('Error al obtener la empresa:', error);
        showMessage('error', 'Hubo un problema al obtener la empresa. Intenta nuevamente.');
        return;
    }

    // Validación de campos obligatorios
    if (!reference || reference.trim() === '' || !details || details.trim() === '' || !cost || cost.trim() === '' || !provider || provider.trim() === '' || !classification || classification.trim() === '') {
        console.error('Campos obligatorios faltantes');
        showMessage('error', 'Por favor, complete todos los campos obligatorios.');
        return;
    }

    try {
        const newId = await getNextId();  // Obtener el nuevo ID

        // Agregar el documento a Firestore con el nombre de la empresa y clínica
        await addDoc(collection(db, 'codigos'), {
            reference,
            details,
            cost,
            code,
            description,  // Se usa el valor de description, o "No disponible" si está vacío
            price,  // Se usa el valor de price, o "0" si está vacío
            empresa: empresaNombre,  // Guardamos el nombre de la empresa obtenido de Firestore
            atribute,  // Se usa el valor de atribute, o "IMPLANTES" si está vacío
            classification,
            usuario,
            clinic: clinic,  // Guardamos el valor de la clínica
            createdAt: new Date(),
        });

        showMessage('success', `El código "${reference}" se ha registrado con éxito.`);
        formRegisterContainer.reset();  // Limpiar formulario

        // Limpiar los spans de descripción y precio
        document.getElementById('registerDescription').textContent = '';  // Limpiar el span de descripción
        document.getElementById('registerPrice').textContent = '';  // Limpiar el span de precio

    } catch (error) {
        console.error("Error al registrar código:", error);
        showMessage('error', 'Error al registrar el código. Intenta nuevamente.');
    } finally {
        showSpinner(false);  // Ocultar el spinner de carga
    }
};
