function cargarFormulario(url) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.width = "99%";
    iframe.height = "805px";
    iframe.frameBorder = "0%";

    mainContent.appendChild(iframe);
}

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.formulario-link');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const target = this.getAttribute('data-target');
            cargarFormulario(target);
        });
    });
});
