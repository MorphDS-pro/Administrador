function showTab(tabName) {
    const sections = document.querySelectorAll('.tab-content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabName}-content`);
    activeTab.classList.add('active');
    activeTab.style.display = 'block';

    const activeButton = document.getElementById(`tab-${tabName}`);
    activeButton.classList.add('active');
}
