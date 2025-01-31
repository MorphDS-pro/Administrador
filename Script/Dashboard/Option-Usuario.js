document.addEventListener('DOMContentLoaded', function () {
  // Elementos
  const userIcon = document.getElementById('user-icon');
  const optionsContainer = document.getElementById('options-container');
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');

  console.log('Script cargado y elementos disponibles');

  // Mostrar/ocultar el contenedor de opciones cuando se hace clic en el icono de usuario
  userIcon.addEventListener('click', function (event) {
      console.log('Clic en el icono de usuario');
      // Evitar que el clic en el icono cierre el contenedor
      event.stopPropagation();
      optionsContainer.classList.toggle('hidden'); // Alterna la visibilidad
  });

  // Cerrar el contenedor si se hace clic fuera de él (en cualquier parte de la página)
  document.addEventListener('click', function (event) {
      console.log('Clic en el documento');
      // Si el clic no es en el icono de usuario ni en el contenedor de opciones
      // ni en los contenedores del sidebar o header
      if (!userIcon.contains(event.target) && 
          !optionsContainer.contains(event.target) &&
          !sidebar.contains(event.target) &&
          !header.contains(event.target)) {
          console.log('Clic fuera del contenedor de opciones');
          optionsContainer.classList.add('hidden'); // Oculta el contenedor
      }
  });

  // Evitar que el clic dentro del contenedor de opciones lo cierre
  optionsContainer.addEventListener('click', function (event) {
      console.log('Clic dentro del contenedor de opciones');
      event.stopPropagation(); // Esto evita que el clic dentro del contenedor cierre el contenedor
  });

  // Redirección al hacer clic en "Cambiar Contraseña"
  document.getElementById('change-password-btn').addEventListener('click', function () {
      console.log('Redirigiendo a cambiar-Pass.html');
      window.location.href = 'components/cambiar-Pass.html';  // Redirige dentro de la misma página
  });
});
