import { dataModel } from './dataModel.js';
import { selectedSocial, selectedOption } from './eventListeners.js'
import { isValidBase64Image } from './utils.js';
import { API_BASE_URL } from '../config.js';

// template loader function
export async function loadTemplate(social, option) {
    try {
        // Handle placeholder template locally
        if (social === 'placeholder') {
            await loadPlaceholderTemplate();
            return;
        }

        const templateUrl = `${API_BASE_URL}/api/templates/${social}/${option}`;
        
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error(`Failed to load template: ${response.statusText}`);
        }

        const template = await response.text();
        
        // Get the capture area element
        const captureArea = document.getElementById('capture-area-front');
        if (!captureArea) {
            throw new Error('Template container not found');
        }

        // Update the template content
        captureArea.innerHTML = template;

        // Update all fields after loading the template
        Object.keys(dataModel.currentModel.data).forEach(key => {
            updatePreview(key);
        });

    } catch (error) {
        console.error('Error loading template:', error);
        loadErrorTemplate();
    }
}

// update preview of template
export function updatePreview(key) {
    if (!selectedSocial || !selectedOption) {
        console.warn('Select a template');
        return;
    }

    try {
        const captureArea = document.getElementById('capture-area-front');
        if (!captureArea) {
            throw new Error('Template container unavailable');
        }

        updateTemplate(key, captureArea);

    } catch (error) {
        console.error('Error updating the template preview:', error);
    }
}

export async function loadPlaceholderTemplate() {
    console.info('Init loadPlaceholderTemplate')
    try {
        const response = await fetch(`../frontend/static/placeholders/placeholder.html`);
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

// auxiliar functions

async function loadErrorTemplate() {
    try {
        const response = await fetch(`../frontend/static/placeholders/load-error.html`);
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

function updateTemplateDurationValues(container) {
    const durationElement = container.querySelector('[data-field="duration"]');
    const unitElement = container.querySelector('[data-field="duration_unit"]');

    if (durationElement) {
        durationElement.textContent = dataModel.currentModel.data.duration.value;
    }
    if (unitElement) {
        unitElement.textContent = dataModel.currentModel.data.duration_unit.value;
    }
}

// update images on template
function updateImageInTemplate(element, value, placeholder = 'static/placeholders/ingeniero.png') {
    if (element.tagName !== 'IMG') {
        console.warn('Not an image element: ', element.tagName)
        return;
    }

    if (!isValidBase64Image(value)) {
        console.warn('Not a valid Base64 image: ', value, 'Using placeholder.');
        element.src = placeholder;
        return;
    }

    element.src = value;
}

// update value on template
function updateTemplate(key, container) {
    try {
        const element = container.querySelector(`[data-field="${key}"]`);
        if (!element) {
            console.warn(`No se encontró elemento para el campo: ${key}`);
            return;
        }

        const field = dataModel.currentModel.data[key];
        if (!field) {
            throw new Error(`Campo no encontrado en el modelo: ${key}`);
        }

        switch (field.type) {
            case 'string':
            case 'number':
                element.innerHTML = field.value;
                break;
            case 'image':
                updateImageInTemplate(element, field.value);
                break;
            case 'duration':
                updateTemplateDurationValues(container);
                break;
            default:
                throw new Error(`Tipo de campo no soportado: ${field.type}`);
        }
    } catch (error) {
        console.error(`Error al actualizar el valor para ${key}:`, error);
    }
}