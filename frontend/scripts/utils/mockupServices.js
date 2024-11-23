import { dataModel } from './dataModel.js';
import { API_BASE_URL } from '../config.js';

/**
 * Triggers the download of a blob as a file in the browser
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The default filename if none is provided in the response
 * @param {Headers} headers - Response headers to check for Content-Disposition
 */
async function downloadFile(blob, filename, headers) {
    try {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Get filename from Content-Disposition header if available
        const contentDisposition = headers.get('Content-Disposition');
        const finalFilename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : filename;

        // Create and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw new Error(`Failed to download file: ${error.message}`);
    }
}

/**
 * Sends mockup data to the server and handles the download of the generated image
 * @returns {Promise<boolean>} True if successful, throws error otherwise
 */
export async function sendMockupData() {
    try {
        const response = await fetch(`${API_BASE_URL}/generate-mockup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataModel.getCurrentModel()),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const imageBlob = await response.blob();
        await downloadFile(imageBlob, 'mockup.png', response.headers);

        return true;
    } catch (error) {
        console.error('Error sending mockup data:', error);
        alert('Error downloading mockup: ' + error.message);
        throw error;
    }
}