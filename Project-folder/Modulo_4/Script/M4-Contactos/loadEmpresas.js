// Importar funciones necesarias desde firebase.js
import { db } from './firebase.js'; // Asegúrate de que la configuración de Firebase esté en este archivo
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Obtener el select donde se agregarán las opciones
const empresaSelect = document.getElementById('empresaSelect');

// Función para cargar los nombres de las empresas
async function loadEmpresas() {
    try {
        // Obtener las empresas de la colección 'empresas' de Firestore
        const querySnapshot = await getDocs(collection(db, 'empresas'));
        
        // Limpiar las opciones actuales del select (si hay alguna)
        empresaSelect.innerHTML = '<option value="">Selecciona una empresa</option>';

        // Verificar si hay datos en Firestore
        if (querySnapshot.empty) {
            console.log('No se encontraron empresas en Firestore.');
            return;
        }

        // Recopilar empresas en un arreglo
        const empresas = [];
        querySnapshot.forEach((doc) => {
            const empresaData = doc.data();
            empresas.push({
                id: doc.id, // Usar el ID del documento generado por Firebase
                nombre: empresaData.empresa // Nombre de la empresa
            });
        });

        // Ordenar las empresas alfabéticamente por su nombre
        empresas.sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Agregar las opciones ordenadas al select
        empresas.forEach((empresa) => {
            const option = document.createElement('option');
            option.value = empresa.id; // El ID de Firestore se usa como valor
            option.textContent = empresa.nombre; // Nombre de la empresa
            empresaSelect.appendChild(option); // Agregar la opción al select
        });
    } catch (error) {
        console.error('Error al obtener las empresas:', error);
    }
}

// Llamar a la función para cargar las empresas cuando el script se ejecute
loadEmpresas();
