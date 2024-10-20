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
// helpers
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
            await loadTemplate(selectedSocial, selectedOption);
        }
    }
}

async function setPlaceholdersValues() {
    let base64String;

    try {
        base64String = await getProfilePicPlaceholderAsBase64('static/placeholders/profile_pic.svg');
    } catch (error) {
        console.warn('Error loading placeholder image:', error);
        base64String = null;
    }

    const placeholders = {
        username: 'username',
        profile_pic: base64String,
        content: 'Lorem @ipsum odor amet, adipiscing #elit. Vel enim enim velit aliquam orci non posuere.',
        likes: '56',
        duration: '12',
        duration_unit: 'hour'
    };

    try {
        for (const field in placeholders) {
            if (field === 'profile_pic') {
                await dataModel.updateModel(field, placeholders[field]);
                displayProfilePicPlaceholder(field, placeholders[field]);
            } else {
                await updatePlaceholderField(field, placeholders[field]);
            }
        }
        return true;
    } catch (error) {
        console.error('Error updating placeholders:', error);
        return false;
    }
}

async function getProfilePicPlaceholderAsBase64(imageUrl) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return await imageToBase64(blob);
}

function displayProfilePicPlaceholder(field, base64String) {
    const element = document.getElementById(field);
    if (element) {
        element.src = base64String
    } else {
        console.warn('Profile picture preview element not found');
    }
}

async function updatePlaceholderField(field, value) {
    const element = document.getElementById(field);
    if (element) {
        element.value = value;
        await dataModel.updateModel(field, value);
    } else {
        console.warn(`Element with id "${field}" not found. Skipping placeholder assignment.`);
    }
}

function resetOptionSelector() {
    selectedOption = null;
    dataModel.updateTemplateData('option', null);
    document.querySelectorAll('.option-button').forEach(button => {
        button.classList.remove('selected'); // Remueve cualquier selección previa
    });
    document.getElementById('option-selector').style.display = 'none'; // Ocultar las opciones
}