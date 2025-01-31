// Importar las funciones necesarias desde los SDKs de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
  authDomain: "prestaciones-57dcd.firebaseapp.com",
  projectId: "prestaciones-57dcd",
  storageBucket: "prestaciones-57dcd.firebasestorage.app",
  messagingSenderId: "409471759723",
  appId: "1:409471759723:web:faa6812772f44baa3ec82e",
  measurementId: "G-0CZ9BMJWMV"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener las instancias de Firestore y Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar las instancias para su uso en otros archivos
export { db, auth };
