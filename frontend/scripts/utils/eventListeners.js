import { updateModel } from './dataModel.js'
import { updatePreview, loadTemplate } from './updatePreview.js'

export let selectedSocial = null;
export let selectedOption = null;

// live updates
export function inititalizeUpdates() {
    const inputFields = document.querySelector('.input-fields');

    inputFields.addEventListener('input', (event) => {
        const target = event.target;

        if (target.matches('input, textarea, select, [type="file"]')) {
            updateModel(target);
            updatePreview(target.id);

            if (target.id === 'profile_pic') {
                const fileLabel = document.querySelector('.file-text');
                showSelectedPic(target, fileLabel);
            }

        }
    });
}

// handles social media buttons
export function initializeSocialMediaEvents() {
    const socialButtons = document.querySelectorAll('.social-button');

    socialButtons.forEach(button => {
        button.addEventListener('click', function () {
            const social = this.getAttribute('data-social');
            resetOptionSelector();

            if (selectedSocial === social) {
                selectedSocial = null;
                loadPlaceholderTemplate();
            } else {
                selectedSocial = social;
                console.log("Red social seleccionada:", selectedSocial);
                document.getElementById('option-selector').style.display = 'block';
            }
        });
    });
}

// handles template options button
export function initializeOptionButtonEvents() {
    const optionButtons = document.querySelectorAll('.option-button');

    optionButtons.forEach(button => {
        button.addEventListener('click', function () {
            selectedOption = this.getAttribute('data-option');
            console.log("Opción seleccionada:", selectedOption);

            // Remover la clase seleccionada de otros botones
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');

            // Verificar que ambas selecciones estén hechas
            if (selectedSocial && selectedOption) {
                loadTemplate(selectedSocial, selectedOption);
            }
        });
    });
}

export function setPlaceholdersValues() {
    const placeholders = {
        username: 'username',
        content: 'Lorem @ipsum odor amet, adipiscing #elit. Vel enim enim velit aliquam orci non posuere. Lectus consequat.',
        likes: '56',
        duration: '12',
        duration_unit: 'hour'
    };

    for (const field in placeholders) {
        const element = document.getElementById(field);
        if (element) {
            element.value = placeholders[field];
            updateModel(element);
        } else {
            console.warn(`Element with id "${field}" not found. Skipping placeholder assignment.`);
        }
    }
}

export async function loadPlaceholderTemplate() {
    try {
        const response = await fetch(`../templates/placeholder.html`);
        const template = await response.text();
        const captureArea = document.getElementById('capture-area-front');

        if (captureArea) {
            captureArea.innerHTML = template;
        } else {
            console.error('El contenedor de la vista previa no existe');
        }
    } catch (error) {
        console.error('Error al cargar la plantilla placeholder:', error);
        loadErrorTemplate();
    }
}

export async function loadErrorTemplate() {
    try {
        const response = await fetch(`../templates/load-error.html`);
        const template = await response.text();
        const captureArea = document.getElementById('capture-area-front');

        if (captureArea) {
            captureArea.innerHTML = template;
        } else {
            console.error('El contenedor de la vista previa no existe');
        }
    } catch (error) {
        console.error('Error al cargar la plantilla de error:', error);
    }
}

// auxiliar functions

// show name of the file on the upload file button
function showSelectedPic(fileInput, fileLabel) {
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        fileLabel.textContent = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
    } else {
        fileLabel.textContent = 'Seleccionar imagen';
    }
}

function resetOptionSelector() {
    selectedOption = null;
    document.querySelectorAll('.option-button').forEach(button => {
        button.classList.remove('selected'); // Remueve cualquier selección previa
    });
    document.getElementById('option-selector').style.display = 'none'; // Ocultar las opciones
}