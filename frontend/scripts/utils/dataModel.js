export let currentModel = {};

// model to capture data
export function createModel() {
    return {
        template: {
            social: null,
            option: null
        },
        data: {
            username: { value: null, type: 'string', format: 'username' },
            profile_pic: { value: 'static/placeholders/profile_pic.svg', type: 'image', format: '' },
            content: { value: null, type: 'string', format: 'content' },
            likes: { value: null, type: 'number', format: '' },
            duration: { value: null, type: 'duration', format: '' },
            duration_unit: { value: null, type: 'duration', format: '' }
        },
        config: {
            dark: false,
            width: null,
            height: null
        }
    };
}

// primary function
export function updateModel(inputElement) {
    try {

        // type of field from model
        const field = currentModel.data[inputElement.id];
        if (!field) {
            throw new Error(`Field not found in model: ${inputElement.id}`);
        }

        // function for type
        const updateFunction = updateModelFunctions[field.type];
        if (!updateFunction) {
            throw new Error(`Unsupported field type: ${field.type}`);
        }

        updateFunction(field, inputElement.value);

    } catch (error) {
        console.log(`Error updating model: ${error.message}`);
    }
}

// auxiliar functions

// Global object to store update functions for different field types
const updateModelFunctions = {
    string: (field, inputValue) => {
        field.value = inputValue;
        if (field.format) {
            field.value = formatString(field.format, field.value);
        }
    },
    number: (field, inputValue) => {
        const parsedValue = parseInt(inputValue, 10);
        if (isNaN(parsedValue)) {
            throw new Error(`Invalid value for numeric field: ${field.id}`);
        }
        field.value = parsedValue;
    },
    image: (fieldId) => {
        updatePicOnModel(fieldId);
    },
    duration: () => {
        updateDurationInModel();
    },
};

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
    currentModel.data.duration.value = transformed.duration;
    currentModel.data.duration_unit.value = transformed.unit;
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
            currentModel.data[imageField].value = file;
        } else {
            console.warn(`No se seleccionó ninguna imagen para ${imageField}.`);
        }
    } catch (error) {
        console.error(`Error al actualizar la imagen ${imageField}:`, error);
        // Establecer una imagen por defecto en caso de error
        currentModel.data[imageField].value = null;
    }
}