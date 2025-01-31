// Seleccionar elementos
const logoutContainer = document.getElementById('logout-confirmation');
const confirmLogout = document.getElementById('confirm-logout');
const cancelLogout = document.getElementById('cancel-logout');
const logoutBtn = document.getElementById('logout-btn');

// Función para mostrar el contenedor de confirmación de cierre de sesión
function showLogoutConfirmation() {
  logoutContainer.classList.add('active');
}

// Función para ocultar el contenedor de confirmación de cierre de sesión
function hideLogoutConfirmation() {
  logoutContainer.classList.remove('active');
}

// Evento para mostrar el contenedor al presionar el botón "Salir"
logoutBtn.addEventListener('click', (event) => {
  event.preventDefault(); // Evitar el comportamiento predeterminado del botón
  showLogoutConfirmation();
});

// Evento para redirigir a index.html al confirmar el cierre de sesión
confirmLogout.addEventListener('click', () => {
  console.log('Cerrando sesión...');
  window.location.href = 'index.html'; // Redirigir a index.html
});

// Evento para ocultar el contenedor al cancelar el cierre de sesión
cancelLogout.addEventListener('click', hideLogoutConfirmation);
