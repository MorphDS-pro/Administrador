function showSection(sectionId) { 
    document.querySelector('.contenedor-principal').style.display = 'none';
  
    const sections = document.querySelectorAll('.contenedor-seccion');
    sections.forEach(function(section) {
        section.style.display = 'none';
    });
  
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }
}
  
function volverAlMenu() {
    const sections = document.querySelectorAll('.contenedor-seccion');
    sections.forEach(function(section) {
        section.style.display = 'none';
    });
  
    document.querySelector('.contenedor-principal').style.display = 'block';
}
  
function toggleSubmenu(element) {
    const allSubmenus = document.querySelectorAll('.submenu');
    allSubmenus.forEach(submenu => {
        if (submenu !== element.nextElementSibling) {
            submenu.style.display = 'none';
        }
    });
  
    const submenu = element.nextElementSibling;
  
    if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
    } else {
        submenu.style.display = 'none';
    }
  
    const allIcons = document.querySelectorAll(".fas.fa-chevron-right");

    allIcons.forEach(icon => {
        if(icon !== element.querySelector(".fas.fa-chevron-right")) {
            icon.classList.remove("rotated");
        }
    });
    
    const icon = element.querySelector(".fas.fa-chevron-right");
    icon.classList.toggle("rotated"); 
}
