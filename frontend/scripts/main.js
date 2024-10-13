// global var
let selectedSocial = null;
let selectedOption = null;
let currentModel = {};

document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = document.querySelectorAll('.social-button');
    const optionButtons = document.querySelectorAll('.option-button');

    // init model
    currentModel = createModel();
    setPlaceholdersValues();
    loadPlaceholderTemplate();

    // init events
    inititalizeUpdates();
    initializeSocialMediaEvents();
    initializeOptionButtonEvents();

});

// live updates
function inititalizeUpdates() {
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

// show name of the file on the upload file button
function showSelectedPic(fileInput, fileLabel) {
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        fileLabel.textContent = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
    } else {
        fileLabel.textContent = 'Seleccionar imagen';
    }
}

// handles social media buttons
function initializeSocialMediaEvents() {
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
function initializeOptionButtonEvents() {
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

// reset the template selector
function resetOptionSelector() {
    selectedOption = null;
    document.querySelectorAll('.option-button').forEach(button => {
        button.classList.remove('selected'); // Remueve cualquier selección previa
    });
    document.getElementById('option-selector').style.display = 'none'; // Ocultar las opciones
}

// set placeholder values
function setPlaceholdersValues() {
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

// load placeholder template
async function loadPlaceholderTemplate() {
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

// load error template placeholder
async function loadErrorTemplate() {
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

// model to capture data
function createModel() {
    return {
        username: { value: null, type: 'string', format: 'username' },
        profile_pic: { value: 'static/placeholders/profile_pic.svg', type: 'image' },
        content: { value: null, type: 'string', format: 'content' },
        likes: { value: null, type: 'number' },
        duration: { value: null, type: 'duration' },
        duration_unit: { value: null, type: 'duration' }
    };
}

// update template values
function insertValuesIntoTemplate(template, model) {
    try {
        Object.keys(model).forEach(key => {
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            if (template.match(regex)) {
                template = template.replace(regex, model[key] || '');
            } else if (model[key]) {
                console.log(`La plantilla no tiene campo para: ${key}`);
            }
            if (!model[key]) {
                console.log(`Falta ${key} para completar el modelo`);
            }
        });
        return template;
    } catch (error) {
        console.error('Error insertando los valores en la plantilla:', error);
        return template;
    }
}

// template loader function
async function loadTemplate(social, option) {
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

// update preview
function updatePreview(key) {
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

// formatting functions
function formatString(type, string) {
    switch (type) {
        case 'username':
            return string.toLowerCase().replace(/[^a-z0-9._]/g, '');
        case 'content':
            return string.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
                .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
        // Agrega más casos aquí para otros tipos de formato
        default:
            return string; // Si el tipo no coincide, devuelve la cadena sin cambios
    }
}

function transformDuration(duration, unit) {
    const units = {
        'sec': { next: 'min', divisor: 60, threshold: 60 },
        'min': { next: 'hour', divisor: 60, threshold: 90 },
        'hour': { next: 'day', divisor: 24, threshold: 24 },
        'day': { next: 'week', divisor: 7, threshold: 30 },
        'week': { next: null, divisor: null, threshold: null }
    };

    // handle invalid inputs
    duration = parseInt(duration, 10);
    if (isNaN(duration) || !units[unit]) {
        console.log('Invalid number or unit for duration transformation');
        return { duration: 0, unit: 's' };
    }

    // transform if required
    if (units[unit].divisor && duration > units[unit].threshold) {
        const newDuration = Math.round(duration / units[unit].divisor);
        const newUnit = units[unit].next;
        return transformDuration(newDuration, newUnit);
    }

    // do not need transformation
    return { duration, unit: unit[0] };
}

// special model updates
function updateDurationInModel() {
    // get current values
    const duration = document.getElementById('duration').value;
    const unit = document.getElementById('duration_unit').value;

    // format values
    const transformed = transformDuration(duration, unit);

    // set formatted values
    currentModel.duration.value = transformed.duration;
    currentModel.duration_unit.value = transformed.unit;
}

function updatePicOnModel(imageField) {
    try {
        const fileInput = document.getElementById(imageField);
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            // Verificar si el archivo es una imagen
            if (!file.type.startsWith('image/')) {
                throw new Error('El archivo seleccionado no es una imagen.');
            }
            // Actualizar el modelo con el archivo
            currentModel[imageField].value = file;
        } else {
            console.warn(`No se seleccionó ninguna imagen para ${imageField}.`);
        }
    } catch (error) {
        console.error(`Error al actualizar la imagen ${imageField}:`, error);
        // Establecer una imagen por defecto en caso de error
        currentModel[imageField].value = null;
    }
}

// primary function
function updateModel(inputElement) {
    try {
        const field = currentModel[inputElement.id];
        if (!field) {
            throw new Error(`Campo no encontrado en el modelo: ${inputElement.id}`);
        }

        switch (field.type) {
            case 'string':
                field.value = inputElement.value;
                if (field.format) {
                    field.value = formatString(field.format, field.value);
                }
                break;
            case 'number':
                field.value = parseInt(inputElement.value, 10);
                if (isNaN(field.value)) {
                    throw new Error(`Valor inválido para el campo numérico: ${inputElement.id}`);
                }
                break;
            case 'image':
                updatePicOnModel(inputElement.id);
                break;
            case 'duration':
                updateDurationInModel();
                break;
            default:
                throw new Error(`Tipo de campo no soportado: ${field.type}`);
        }

    } catch (error) {
        console.log(`Error updating model: ${error.message}`);
    }
}