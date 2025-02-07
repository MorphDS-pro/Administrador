import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { getFirestore, query, where, getDocs, collection } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCAQefjRO9ixEnnlyIohqnOI4MVzC38lc8",
    authDomain: "administrador-638bc.firebaseapp.com",
    projectId: "administrador-638bc",
    storageBucket: "administrador-638bc.firebasestorage.app",
    messagingSenderId: "31705925031",
    appId: "1:31705925031:web:0f3c1158f7a7ff91fde282",
    measurementId: "G-EJFSB52GBN"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById('loginForm');
const overlay = document.getElementById('overlay');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    overlay.style.display = 'flex';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where("usuario", "==", username));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userEmail = userDoc.data().correo;

            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            const user = userCredential.user;

            if (user) {
                sessionStorage.setItem('userId', userDoc.id);

                window.location.href = 'dashboard.html';
            }
        } else {
            alert("Nombre de usuario no encontrado.");
        }
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        alert("Credenciales incorrectas. Intenta nuevamente.");
    } finally {
        overlay.style.display = 'none';
    }
});