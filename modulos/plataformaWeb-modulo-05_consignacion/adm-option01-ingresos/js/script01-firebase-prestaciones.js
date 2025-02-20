import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';

// Configuración para el primer proyecto (Prestaciones)
const firebaseConfig1 = {
  apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
  authDomain: "prestaciones-57dcd.firebaseapp.com",
  projectId: "prestaciones-57dcd",
  storageBucket: "prestaciones-57dcd.firebasestorage.app",
  messagingSenderId: "409471759723",
  appId: "1:409471759723:web:faa6812772f44baa3ec82e",
  measurementId: "G-0CZ9BMJWMV"
};

// Configuración para el segundo proyecto (Consignaciones)
const firebaseConfig2 = {
  apiKey: "AIzaSyDlOW1-vrW4uiXrveFPoBcJ1ImZlPqzzlA",
  authDomain: "consignaciones-ee423.firebaseapp.com",
  projectId: "consignaciones-ee423",
  storageBucket: "consignaciones-ee423.firebasestorage.app",
  messagingSenderId: "992838229253",
  appId: "1:992838229253:web:38462a4886e4ede6a7ab6c",
  measurementId: "G-K58BRH151H"
};

// Inicialización de Firebase para ambos proyectos
const app1 = getApps().some(app => app.name === "prestaciones") 
  ? getApps().find(app => app.name === "prestaciones") 
  : initializeApp(firebaseConfig1, "prestaciones");

const app2 = getApps().some(app => app.name === "consignaciones") 
  ? getApps().find(app => app.name === "consignaciones") 
  : initializeApp(firebaseConfig2, "consignaciones");

// Obtener referencias a Firestore y Auth para cada proyecto
const db1 = getFirestore(app1);
const auth1 = getAuth(app1);

const db2 = getFirestore(app2);
const auth2 = getAuth(app2);

export { db1, auth1, db2, auth2 };
