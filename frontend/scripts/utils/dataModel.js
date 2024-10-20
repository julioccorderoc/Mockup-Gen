//TODO set an image for the cases when an error happens uploading the profile pic
import {
    imageToBase64,
    isValidBase64Image
} from './utils.js';

class DataModel {
    constructor() {
        this.currentModel = this.createModel();
    }

    createModel() {
        return {
            template: {
                social: null,
                option: null
            },
            data: {
                username: { value: null, type: 'string', format: 'username' },
                profile_pic: { value: null, type: 'image', format: 'base64' },
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

    updateTemplateData(field, value) {
        switch (field) {
            case 'social':
                this.currentModel.template.social = value;
                break;
            case 'option':
                this.currentModel.template.option = value;
                break;
            case 'reset':
                this.currentModel.template.social = null;
                this.currentModel.template.option = null;
                break;
        }
    }

    async updateModel(inputId, inputValue) {
        try {
            const field = this.currentModel.data[inputId];
            if (!field) {
                throw new Error(`Field not found in model: ${inputId}`);
            }

            const updateFunction = this.updateModelFunctions[field.type];
            if (!updateFunction) {
                throw new Error(`Unsupported field type: ${field.type}`);
            }

            await updateFunction.call(this, inputId, field, inputValue);
            return true;

        } catch (error) {
            console.error(`Error updating model: ${error.message}`);
            return false;
        }
    }

    updateModelFunctions = {
        string: (inputId, field, inputValue) => {
            field.value = this.formatString(field.format, inputValue);
        },
        number: (inputId, field, inputValue) => {
            const parsedValue = parseInt(inputValue, 10);
            if (isNaN(parsedValue)) {
                throw new Error(`Invalid value for numeric field: ${inputId}`);
            }
            field.value = parsedValue;
        },
        image: async (inputId, field, inputValue) => {
            await this.updateImageInModel(inputId, inputValue);
        },
        duration: () => {
            this.updateDurationInModel();
        },
    };

    formatString(type, string) {
        switch (type) {
            case 'username':
                return string.toLowerCase().replace(/[^a-z0-9._]/g, '');
            case 'content':
                return string.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
                    .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
            default:
                return string;
        }
    }

    formatDuration(duration, unit) {
        const units = {
            'sec': { next: 'min', divisor: 60, threshold: 60 },
            'min': { next: 'hour', divisor: 60, threshold: 90 },
            'hour': { next: 'day', divisor: 24, threshold: 24 },
            'day': { next: 'week', divisor: 7, threshold: 30 },
            'week': { next: null, divisor: null, threshold: null }
        };

        duration = parseInt(duration, 10);
        if (isNaN(duration) || !units[unit]) {
            console.warn('Invalid number or unit for duration transformation');
            return { duration: 0, unit: 's' };
        }

        if (units[unit].divisor && duration > units[unit].threshold) {
            const newDuration = Math.round(duration / units[unit].divisor);
            const newUnit = units[unit].next;
            return this.formatDuration(newDuration, newUnit);
        }

        return { duration, unit: unit[0] };
    }

    updateDurationInModel() {
        const duration = document.getElementById('duration').value;
        const unit = document.getElementById('duration_unit').value;

        const transformed = this.formatDuration(duration, unit);

        this.currentModel.data.duration.value = transformed.duration;
        this.currentModel.data.duration_unit.value = transformed.unit;
    }

    async updateImageInModel(imageFieldId, inputValue) {
        if (isValidBase64Image(inputValue)) {
            this.currentModel.data[imageFieldId].value = inputValue;
            return;
        }

        try {
            const fileInput = document.getElementById(imageFieldId);
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                if (!file.type.startsWith('image/')) {
                    throw new Error('El archivo seleccionado no es una imagen.');
                }

                const base64String = await imageToBase64(file);
                this.currentModel.data[imageFieldId].value = base64String;

            } else {
                console.warn(`No se seleccionó ninguna imagen para ${imageFieldId}.`);
            }
        } catch (error) {
            console.error(`Error al actualizar la imagen ${imageFieldId}:`, error);
            this.currentModel.data[imageFieldId].value = null;
        }
    }

    // old function for files only and sending formdata
    updatePicOnModelFILE(imageFieldId) {
        try {
            const fileInput = document.getElementById(imageFieldId);
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                if (!file.type.startsWith('image/')) {
                    throw new Error('The selected file is not an image.');
                }
                this.currentModel.data[imageFieldId].value = file;
            } else {
                console.warn(`No image selected for ${imageFieldId}.`);
            }
        } catch (error) {
            console.error(`Error updating image ${imageFieldId}:`, error);
            this.currentModel.data[imageFieldId].value = null;
        }
    }

    getCurrentModel() {
        return this.currentModel;
    }
}

export const dataModel = new DataModel();
window.dataModel = dataModel;