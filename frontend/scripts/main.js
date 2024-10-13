// global var
let selectedSocial = null;
let selectedOption = null;
let currentModel = {};

document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = document.querySelectorAll('.social-button');
    const optionButtons = document.querySelectorAll('.option-button');

    // init model
    setPlaceholdersValues();
    loadPlaceholderTemplate();
    currentModel = createModel();

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
                updateDurationInModel();
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
    document.getElementById('username').value = 'username';
    document.getElementById('content').value = 'Lorem @ipsum odor amet, adipiscing #elit. Vel enim enim velit aliquam orci non posuere. Lectus consequat.';
    document.getElementById('likes').value = '56';
    document.getElementById('duration').value = '12';
    document.getElementById.value = 'day';
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
// add type of value property to improve the updates
function createModel() {
    return {
        username: document.getElementById('username').value,
        profile_pic: 'static/placeholders/profile_pic.svg',
        content: document.getElementById('content').value,
        likes: document.getElementById('likes').value,
        duration: document.getElementById('duration').value,
        duration_unit: document.getElementById('duration_unit').value
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
        durationElement.textContent = currentModel.duration;
    }
    if (unitElement) {
        unitElement.textContent = currentModel.duration_unit;
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

        let value = currentModel[key];

        switch (key) {
            case 'username':
                value = formatString(key, value);
                break;
            case 'content':
                element.innerHTML = formatString(key, value);
                return;
            case 'duration':
            case 'duration_unit':
                updateTemplateDurationValues(container);
                return;
            case 'profile_pic':
                updateTemplateImages(element, value);
                break;
        }

        element.textContent = value;

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
        'sec': { next: 'min', factor: 60 },
        'min': { next: 'hour', factor: 60 },
        'hour': { next: 'day', factor: 24 },
        'day': { next: 'week', factor: 7 },
        'week': { next: null, factor: null }
    };

    duration = parseInt(duration, 10);

    // Si la duración no es un número válido o la unidad es inválida, devolvemos valores por defecto
    if (isNaN(duration) || !units[unit]) {
        return { duration: 0, unit: 'sec' };
    }

    // Si la duración es mayor que el factor de conversión y no estamos en la unidad máxima
    if (units[unit].factor && duration >= units[unit].factor) {
        const newDuration = Math.floor(duration / units[unit].factor);
        const newUnit = units[unit].next;

        // Llamada recursiva para continuar la conversión si es necesario
        return transformDuration(newDuration, newUnit);
    }

    // Si no se necesita conversión, devolvemos los valores actuales
    return { duration, unit: unit[0] };
}

// special model updates
function updateDurationInModel() {
    // Obtenemos los valores actuales de los inputs
    const duration = document.getElementById('duration').value;
    const unit = document.getElementById('duration_unit').value;

    // Transformamos la duración
    const transformed = transformDuration(duration, unit);

    // Actualizamos el modelo con los valores transformados
    currentModel.duration = transformed.duration;
    currentModel.duration_unit = transformed.unit;
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
            currentModel[imageField] = file;
            console.log(`Imagen ${imageField} actualizada en el modelo.`);
        } else {
            console.warn(`No se seleccionó ninguna imagen para ${imageField}.`);
        }
    } catch (error) {
        console.error(`Error al actualizar la imagen ${imageField}:`, error);
        // Establecer una imagen por defecto en caso de error
        currentModel[imageField] = null;
    }
}

// primary function
function updateModel(inputElement) {
    try {
        if (inputElement.id === 'duration' || inputElement.id === 'duration_unit') {
            updateDurationInModel();
        } else if (inputElement.id === 'profile_pic') {
            updatePicOnModel('profile_pic');
        } else {
            currentModel[inputElement.id] = inputElement.value; // need to update the modified values, and simplify updateTemplate
        }
    } catch (error) {
        console.error(`Error al actualizar el modelo: ${error.message}`);
    }
}