import { db } from './S01-Firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const registerProvider = document.getElementById('registerProvider');

async function loadEmpresas() {
    if (!registerProvider) {
        console.error('Elemento #registerProvider no encontrado.');
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, 'empresas'));
        
        registerProvider.innerHTML = '<option value="">Selecciona una empresa</option>';

        if (querySnapshot.empty) {
            console.log('No se encontraron empresas en Firestore.');
            const noEmpresasOption = document.createElement('option');
            noEmpresasOption.value = '';
            noEmpresasOption.textContent = 'No hay empresas disponibles';
            registerProvider.appendChild(noEmpresasOption);
            return;
        }

        const empresas = [];
        querySnapshot.forEach((doc) => {
            const empresaData = doc.data();
            empresas.push({
                id: doc.id,
                nombre: empresaData.empresa
            });
        });

        empresas.sort((a, b) => a.nombre.localeCompare(b.nombre));

        const fragment = document.createDocumentFragment();
        empresas.forEach((empresa) => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nombre;
            fragment.appendChild(option);
        });
        registerProvider.appendChild(fragment);

    } catch (error) {
        console.error('Error al obtener las empresas:', error);
        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = 'Error al cargar empresas';
        registerProvider.appendChild(errorOption);
    }
}

loadEmpresas();