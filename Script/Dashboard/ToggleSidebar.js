function showSection(sectionId) { 
    // Ocultar el contenedor principal
    document.querySelector('.contenedor-principal').style.display = 'none';
  
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.contenedor-seccion');
    sections.forEach(function(section) {
        section.style.display = 'none';
    });
  
    // Mostrar la sección correspondiente
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }
  }
  
  function volverAlMenu() {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.contenedor-seccion');
    sections.forEach(function(section) {
        section.style.display = 'none';
    });
  
    // Mostrar el contenedor principal
    document.querySelector('.contenedor-principal').style.display = 'block';
  }
  
  function toggleSubmenu(element) {
    // Primero, ocultar todos los submenús
    const allSubmenus = document.querySelectorAll('.submenu');
    allSubmenus.forEach(submenu => {
        if (submenu !== element.nextElementSibling) {
            submenu.style.display = 'none';
        }
    });
  
    // Obtener el submenú correspondiente al elemento clickeado
    const submenu = element.nextElementSibling;
  
    // Alternar el submenú (mostrarlo si está oculto, ocultarlo si está visible)
    if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
    } else {
        submenu.style.display = 'none';
    }
  
    // Quitar la rotación de todos los iconos de chevron
    const allIcons = document.querySelectorAll(".fas.fa-chevron-right");
    allIcons.forEach(icon => {
        icon.classList.remove("rotated"); // Elimina la rotación de otros iconos
    });
  
    // Obtener el icono del chevron actual y alternar su rotación
    const icon = element.querySelector(".fas.fa-chevron-right"); // Selecciona el icono de chevron
    icon.classList.toggle("rotated"); // Alterna la clase "rotated" para rotar el icono
  }
  