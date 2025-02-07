import { db } from './script01-firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Elemento del formulario de selección de unidad
const registerCompany = document.getElementById('registerCompany');

async function loadEmpresas() {
  try {
    // Obtenemos las unidades desde la colección 'unidades'
    const querySnapshot = await getDocs(collection(db, 'unidades'));
    
    // Limpiamos el contenido previo del select y agregamos la opción inicial
    registerCompany.innerHTML = '<option value="">Selecciona una unidad</option>';
    
    // Si no se encontraron unidades en Firestore
    if (querySnapshot.empty) {
      return;
    }
    
    // Array para almacenar las unidades con su ID y nombre
    const unidades = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Usamos el campo "nombre" (ya que en tus documentos se llama "nombre")
      unidades.push({
        id: doc.id,
        nombre: data.nombre || ''
      });
    });
    
    // Ordenamos las unidades por nombre
    unidades.sort((a, b) => {
      const nombreA = a.nombre || '';
      const nombreB = b.nombre || '';
      return nombreA.localeCompare(nombreB);
    });
    
    // Agregamos cada unidad al select
    unidades.forEach((unidad) => {
      const option = document.createElement('option');
      option.value = unidad.id;         // El valor es el ID de la unidad
      option.textContent = unidad.nombre; // El texto visible es el nombre
      registerCompany.appendChild(option);
    });
  } catch (error) {
    console.error('Error al obtener las unidades:', error);
  }
}

// Ejecutar la carga cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadEmpresas);
