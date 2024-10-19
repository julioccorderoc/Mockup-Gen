import { dataModel } from './dataModel.js';

// Función principal para enviar datos y descargar la imagen
export async function sendMockupData() {
    try {
        const formData = buildFormData();

        // Enviar los datos al backend
        const response = await fetch('/generate-mockup', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obtener el blob de la imagen
        const blob = await response.blob();

        // Usar FileSaver.js para descargar la imagen
        saveAs(blob, 'social-media-mockup.png');

    } catch (error) {
        console.error('Error al enviar los datos del mockup:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
    }
}

// Función para construir el FormData
function buildFormData() {
    const formData = new FormData();
    const currentModel = dataModel.getCurrentModel();

    // Agregar la plantilla seleccionada
    formData.append('template', `${currentModel.template.social}-${currentModel.template.option}`);

    // Agregar los datos del mockup
    for (const [key, value] of Object.entries(currentModel.data)) {
        if (key === 'profile_pic' && value.value instanceof File) {
            formData.append(key, value.value);
        } else {
            formData.append(key, value.value);
        }
    }

    return formData;
}

