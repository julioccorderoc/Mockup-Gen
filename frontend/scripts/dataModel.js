export let currentModel = {};

// model to capture data
export function createModel() {
    return {
        username: { value: null, type: 'string', format: 'username' },
        profile_pic: { value: 'static/placeholders/profile_pic.svg', type: 'image' },
        content: { value: null, type: 'string', format: 'content' },
        likes: { value: null, type: 'number' },
        duration: { value: null, type: 'duration' },
        duration_unit: { value: null, type: 'duration' }
    };
}

// primary function
export function updateModel(inputElement) {
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

// auxiliar functions

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