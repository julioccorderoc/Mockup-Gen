import { dataModel } from './dataModel.js';
import { sendMockupData } from './mockupServices.js';
import {
    imageToBase64,
    showSelectedPicOnFileInput
} from './utils.js';
import {
    updatePreview,
    loadTemplate,
    loadPlaceholderTemplate
} from './updatePreview.js';

export let selectedSocial = null;
export let selectedOption = null;

// live updates
export function initializeUpdates() {
    const inputFields = document.querySelector('.input-fields');
    inputFields.addEventListener('input', (event) => handleInputFieldUpdate(event));
}

export function initializeSocialMediaEvents() {
    const socialButtons = document.querySelectorAll('.social-button');

    socialButtons.forEach(button => {
        button.addEventListener('click', () => handleSocialButtonClick(button));
    });
}

export function initializeOptionButtonEvents() {
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.addEventListener('click', () => handleOptionButtonClick(button, optionButtons));
    });
}

export function initializeDownloadEvent() {
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', sendMockupData);
}

//
// auxiliar functions
//

async function handleInputFieldUpdate(event) {
    const target = event.target;

    if (isValidInputField(target)) {
        const updated = await dataModel.updateModel(target.id, target.value);
        if (updated) {
            updatePreview(target.id);
        }

        if (target.id === 'profile_pic') {
            const fileLabel = document.querySelector('.file-text');
            showSelectedPicOnFileInput(target, fileLabel);
        }
    }
}

function isValidInputField(target) {
    return target.matches('input, textarea, select, [type="file"]');
}

function handleSocialButtonClick(button) {
    const social = button.getAttribute('data-social');

    resetOptionSelector();

    if (selectedSocial === social) {
        selectedSocial = null;
        dataModel.updateTemplateData('reset', null);
        loadPlaceholderTemplate();
    } else {
        selectedSocial = social;
        dataModel.updateTemplateData('social', social);
        document.getElementById('option-selector').style.display = 'block';
    }
}

async function handleOptionButtonClick(button, optionButtons) {
    selectedOption = button.getAttribute('data-option');

    dataModel.updateTemplateData('option', selectedOption);

    // Remove the selected class from other buttons
    optionButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    if (selectedSocial && selectedOption) {
        const placeholdersAreUpdated = await setPlaceholdersValues();
        if (placeholdersAreUpdated) {
            loadTemplate(selectedSocial, selectedOption);
        }
    }
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

function resetOptionSelector() {
    selectedOption = null;
    dataModel.updateTemplateData('option', null);
    document.querySelectorAll('.option-button').forEach(button => {
        button.classList.remove('selected'); // Remueve cualquier selección previa
    });
    document.getElementById('option-selector').style.display = 'none'; // Ocultar las opciones
}