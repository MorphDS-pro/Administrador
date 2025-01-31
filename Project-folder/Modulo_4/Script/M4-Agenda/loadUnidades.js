import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const unidadSelect = document.getElementById('unidadSelect');

async function loadUnidades() {
    try {
        const querySnapshot = await getDocs(collection(db, 'unidades'));
        
        // Limpiar las opciones actuales del select (si hay alguna)
        unidadSelect.innerHTML = '<option value="">Selecciona una unidad</option>';

        if (querySnapshot.empty) {
            console.log('No se encontraron unidades en Firestore.');
            return;
        }

        const unidades = [];
        querySnapshot.forEach((doc) => {
            const unidadData = doc.data();

            // Verificar si 'nombre' existe y tiene un valor válido antes de agregarlo
            if (unidadData && unidadData.nombre) {
                unidades.push({
                    id: doc.id,
                    nombre: unidadData.nombre // Asegurarnos de acceder al campo "nombre"
                });
            } else {
                console.warn(`Unidad con ID ${doc.id} no tiene un nombre válido.`);
            }
        });

        // Verificar si hay unidades con nombres válidos
        if (unidades.length === 0) {
            console.log('No hay unidades con nombres válidos.');
            return;
        }

        // Ordenar las unidades alfabéticamente por su nombre
        unidades.sort((a, b) => {
            // Asegurarnos de que ambos valores de 'nombre' sean válidos
            if (a.nombre && b.nombre) {
                return a.nombre.localeCompare(b.nombre);
            } else {
                return 0; // Si alguno de los valores es inválido, no hacer la comparación
            }
        });

        // Agregar las opciones ordenadas al select
        unidades.forEach((unidad) => {
            const option = document.createElement('option');
            option.value = unidad.id; // El ID de Firestore se usa como valor
            option.textContent = unidad.nombre; // Nombre de la unidad
            unidadSelect.appendChild(option); // Agregar la opción al select
        });
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

loadUnidades();
