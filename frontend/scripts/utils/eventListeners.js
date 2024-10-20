import {
    updatePreview,
    loadTemplate,
    loadPlaceholderTemplate
} from './updatePreview.js';
import { dataModel } from './dataModel.js';
import { sendMockupData } from './mockupServices.js';
import { imageToBase64 } from './utils.js';

export let selectedSocial = null;
export let selectedOption = null;

// live updates
export function initializeUpdates() {
    const inputFields = document.querySelector('.input-fields');

    inputFields.addEventListener('input', async (event) => {
        const target = event.target;

        if (target.matches('input, textarea, select, [type="file"]')) {

            const updated = await dataModel.updateModel(target.id, target.value);
            if (updated) {
                updatePreview(target.id);
            }

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
        button.addEventListener('click', async function () {
            selectedOption = this.getAttribute('data-option');
            console.log("Opción seleccionada:", selectedOption);

            // Remover la clase seleccionada de otros botones
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');

            // Verificar que ambas selecciones estén hechas
            if (selectedSocial && selectedOption) {

                const placeholdersAreUpdated = await setPlaceholdersValues();
                if (placeholdersAreUpdated) {
                    loadTemplate(selectedSocial, selectedOption);
                }

            }
        });
    });
}

// Añadir esta nueva función
export function initializeDownloadEvent() {
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', sendMockupData);
}

//TODO set the profile pic and other images here
async function setPlaceholdersValues() {
    try {
        // Cargar la imagen de placeholder
        const response = await fetch('static/placeholders/profile_pic.svg');
        const blob = await response.blob();
        const base64String = await imageToBase64(blob);

        dataModel.currentModel.data.profile_pic.value = base64String;

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
                await dataModel.updateModel(field, placeholders[field]);
            } else {
                console.warn(`Elemento con id "${field}" no encontrado. Omitiendo asignación de placeholder.`);
            }
        }

        return true;

    } catch (error) {
        console.error('Error al cargar los placeholders:', error);
        return false;
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