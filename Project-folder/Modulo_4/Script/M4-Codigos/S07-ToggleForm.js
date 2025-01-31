document.addEventListener("DOMContentLoaded", () => {
    const btnNew = document.getElementById("bttnNew");
    const formNewContainer = document.getElementById("formNewContainer");
    const formRegisterContainer = document.getElementById("formRegisterContainer");
    const searchContainer = document.getElementById("searchContainer");

    const btnReset = document.getElementById("btnReset");

    btnNew?.addEventListener("click", () => {
        formNewContainer.classList.add("hidden");
        searchContainer.classList.add("hidden");
        formRegisterContainer.classList.remove("hidden");
    });

    btnReset?.addEventListener("click", () => {
        formRegisterContainer.classList.add("hidden");
        formNewContainer.classList.remove("hidden");
        searchContainer.classList.remove("hidden");
    });
});
