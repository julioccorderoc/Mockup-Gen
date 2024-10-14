import { loadErrorTemplate, selectedSocial, selectedOption } from './eventListeners.js'
import { currentModel } from './dataModel.js'

// template loader function
export async function loadTemplate(social, option) {
    const templatePath = `../templates/${social}/${social}-${option}.html`;
    try {
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error('Plantilla no encontrada');
        }

        let template = await response.text();
        document.getElementById('capture-area-front').innerHTML = template;

        // Actualizar todos los campos después de cargar la plantilla
        Object.keys(currentModel).forEach(key => {
            //updateModel(key);
            updatePreview(key);
        });

    } catch (error) {
        console.error('Error al cargar la plantilla:', error);
        loadErrorTemplate();
    }
}

// update preview of template
export function updatePreview(key) {
    if (!selectedSocial || !selectedOption) {
        console.log('Selecciona una opción para actualizar');
        return;
    }

    try {
        const captureArea = document.getElementById('capture-area-front');
        if (!captureArea) {
            throw new Error('Contenedor de la plantilla no disponible');
        }

        updateTemplate(key, captureArea);

    } catch (error) {
        console.error('Error al actualizar la vista previa:', error);
    }
}

// auxiliar functions

// Función para actualizar los valores de duración en la plantilla
function updateTemplateDurationValues(container) {
    // Buscamos los elementos de duración y unidad en la plantilla
    const durationElement = container.querySelector('[data-field="duration"]');
    const unitElement = container.querySelector('[data-field="duration_unit"]');

    // Actualizamos los elementos si existen
    if (durationElement) {
        durationElement.textContent = currentModel.duration.value;
    }
    if (unitElement) {
        unitElement.textContent = currentModel.duration_unit.value;
    }
}

// update images on template
function updateTemplateImages(element, value, placeholder = 'static/placeholders/profile_pic.svg') {
    if (element.tagName === 'IMG') {
        if (value instanceof File) {
            // Crear una URL temporal para la imagen y asignarla al src
            element.src = URL.createObjectURL(value);
        } else {
            // Asignar la imagen existente o el placeholder por defecto
            element.src = value || placeholder;
        }
    }
}

// update value on template
function updateTemplate(key, container) {
    try {
        const element = container.querySelector(`[data-field="${key}"]`);
        if (!element) {
            console.warn(`No se encontró elemento para el campo: ${key}`);
            return;
        }

        const field = currentModel[key];
        if (!field) {
            throw new Error(`Campo no encontrado en el modelo: ${key}`);
        }

        switch (field.type) {
            case 'string':
            case 'number':
                element.innerHTML = field.value;
                break;
            case 'image':
                updateTemplateImages(element, field.value);
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