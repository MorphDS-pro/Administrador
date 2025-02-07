document.addEventListener('DOMContentLoaded', function () {
  const userIcon = document.getElementById('user-icon');
  const optionsContainer = document.getElementById('options-container');
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');


  userIcon.addEventListener('click', function (event) {
      event.stopPropagation();
      optionsContainer.classList.toggle('hidden');
  });

  document.addEventListener('click', function (event) {

      if (!userIcon.contains(event.target) && 
          !optionsContainer.contains(event.target) &&
          !sidebar.contains(event.target) &&
          !header.contains(event.target)) {
          console.log('Clic fuera del contenedor de opciones');
          optionsContainer.classList.add('hidden');
      }
  });

  optionsContainer.addEventListener('click', function (event) {
      event.stopPropagation();
  });

  document.getElementById('change-password-btn').addEventListener('click', function () {
      window.location.href = 'components/cambiar-Pass.html'; 
  });
});
