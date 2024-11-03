import { dataModel } from './dataModel.js';

export async function sendMockupData() {
    try {
        const response = await fetch('http://localhost:8000/generate-mockup', {
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

        // Get the blob and create a URL for it
        const imageBlob = await response.blob();
        const url = window.URL.createObjectURL(imageBlob);

        // Get the filename from the Content-Disposition header, or use a default
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : 'mockup.png';

        // Create a temporary link element and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error sending mockup data:', error);
        alert('Error downloading mockup: ' + error.message);
        throw error;
    }
}