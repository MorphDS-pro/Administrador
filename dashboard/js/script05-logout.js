const logoutContainer = document.getElementById('logout-confirmation');
const confirmLogout = document.getElementById('confirm-logout');
const cancelLogout = document.getElementById('cancel-logout');
const logoutBtn = document.getElementById('logout-btn');

function showLogoutConfirmation() {
  logoutContainer.classList.add('active');
}

function hideLogoutConfirmation() {
  logoutContainer.classList.remove('active');
}

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  showLogoutConfirmation();
});

confirmLogout.addEventListener('click', () => {
  console.log('Cerrando sesión...');
  window.location.href = 'index.html';
});

cancelLogout.addEventListener('click', hideLogoutConfirmation);
