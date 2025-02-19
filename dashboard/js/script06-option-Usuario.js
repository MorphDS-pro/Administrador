document.addEventListener('DOMContentLoaded', function () {
  const userIcon = document.getElementById('user-icon');
  const userContainer = document.getElementById('user-container');
  const optionsContainer = document.getElementById('options-container');
  const optionLinks = optionsContainer.querySelectorAll('a.formulario-link');

  userIcon.addEventListener('click', function (event) {
    event.stopPropagation();
    optionsContainer.classList.toggle('hidden');
  });

  document.addEventListener('click', function (event) {
    if (!userContainer.contains(event.target)) {
      optionsContainer.classList.add('hidden');
    }
  });

  optionsContainer.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  optionLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      optionsContainer.classList.add('hidden');
    });
  });
});
