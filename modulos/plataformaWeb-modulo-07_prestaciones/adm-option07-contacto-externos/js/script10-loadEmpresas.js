import { db } from './script01-firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Elemento del formulario de selección de empresa
const registerCompany = document.getElementById('registerCompany');

// Función que carga las empresas desde Firestore
async function loadEmpresas() {
    try {
        // Obtenemos las empresas desde la colección 'companies' en Firestore
        const querySnapshot = await getDocs(collection(db, 'companies'));

        // Limpiamos el contenido previo del select y agregamos la opción inicial
        registerCompany.innerHTML = '<option value="">Selecciona una empresa</option>';

        // Si no hay empresas en la base de datos
        if (querySnapshot.empty) {
            console.log('No se encontraron empresas en Firestore.');
            return;
        }

        // Array para almacenar las empresas con su ID y nombre
        const empresas = [];
        querySnapshot.forEach((doc) => {
            const empresaData = doc.data();
            empresas.push({
                id: doc.id,  // ID de la empresa
                nombre: empresaData.empresa || ''  // Nombre de la empresa, si no existe lo reemplazamos por una cadena vacía
            });
        });

        // Ordenamos las empresas por nombre de manera segura
        empresas.sort((a, b) => {
            const nombreA = a.nombre || '';  // Si 'nombre' es undefined, lo reemplazamos por una cadena vacía
            const nombreB = b.nombre || '';  // Lo mismo para 'nombre' de b
            return nombreA.localeCompare(nombreB);  // Comparamos los nombres de las empresas
        });

        // Agregamos las opciones al select
        empresas.forEach((empresa) => {
            const option = document.createElement('option');
            option.value = empresa.id;  // ID de la empresa como valor
            option.textContent = empresa.nombre;  // Nombre de la empresa como texto visible
            registerCompany.appendChild(option);  // Añadimos la opción al select
        });
    } catch (error) {
        console.error('Error al obtener las empresas:', error);  // Si hay un error, lo mostramos en la consola
    }
}

// Llamamos a la función para cargar las empresas
loadEmpresas();
