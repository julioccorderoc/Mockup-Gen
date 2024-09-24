document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('profile-pic');
    const fileLabel = document.querySelector('.file-text');

    // Evento para mostrar el nombre del archivo seleccionado
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            fileLabel.textContent = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
        } else {
            fileLabel.textContent = 'Seleccionar imagen';
        }
    });

});