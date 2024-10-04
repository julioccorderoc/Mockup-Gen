document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-btn');
    // Evento para el botón de descarga
    downloadBtn.addEventListener('click', downloadImage);

    function downloadImage() {
        const element = document.getElementById('capture-area');
        if (!element) {
            console.error('Element with id "capture-area" not found');
            return;
        }

        // Obtener las dimensiones del elemento
        const rect = element.getBoundingClientRect();
        const options = {
            width: rect.width,
            height: rect.height,
            style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
                width: `${rect.width}px`,
                height: `${rect.height}px`
            }
        };

        // Convertir el elemento a imagen PNG
        htmlToImage.toPng(element, options)
            .then(function (dataUrl) {
                // Convertir la URL de datos a un Blob
                const blob = dataURLToBlob(dataUrl);
                // Descargar la imagen usando FileSaver.js
                saveAs(blob, 'instagram-comment.png');
            })
            .catch(function (error) {
                console.error('Error generating image:', error);
            });
    }

    // Función para convertir una URL de datos a un Blob
    function dataURLToBlob(dataUrl) {
        // Decodificar la cadena Base64
        const byteString = atob(dataUrl.split(',')[1]);
        // Obtener el tipo MIME de la URL de datos
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

        // Crear un ArrayBuffer para almacenar los datos binarios
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);

        // Asignar los datos binarios al Uint8Array
        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }

        // Crear un Blob a partir del ArrayBuffer
        return new Blob([arrayBuffer], { type: mimeString });
    }
});

