export function showSelectedPicOnFileInput(fileInput, fileLabel) {
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        fileLabel.textContent = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
    } else {
        fileLabel.textContent = 'Seleccionar imagen';
    }
}

// transform file to Base64
export function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export function isValidBase64Image(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }

    // Check if the string starts with the data URI scheme
    if (!str.startsWith('data:')) {
        return false;
    }

    // Split the string to separate MIME type and base64 data
    const [header, base64Data] = str.split(',');

    // Check if we have both parts
    if (!header || !base64Data) {
        return false;
    }

    // Check if the MIME type is an image type
    const supportedImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
    if (!supportedImageTypes.some(type => header.includes(type))) {
        return false;
    }

    // Validate base64 data
    try {
        atob(base64Data);
        return true;
    } catch (e) {
        console.error('Invalid base64 data:', e);
        return false;
    }
}