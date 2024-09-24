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

        htmlToImage.toPng(element, options)
            .then(function (dataUrl) {
                const link = document.createElement('a');
                link.download = 'instagram-comment.png';
                link.href = dataUrl;
                link.click();
            })
            .catch(function (error) {
                console.error('Error generating image:', error);
            });
    }
});

