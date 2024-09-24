document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = document.querySelectorAll('.social-button');
    //const form = document.getElementById('comment-form');
    const preview = document.getElementById('preview');
    const downloadBtn = document.getElementById('download-btn');

    let selectedSocial = null;

    // Establecer valores predeterminados
    document.getElementById('username').value = 'username';
    document.getElementById('content').value = 'Lorem @ipsum odor amet, consectetuer adipiscing #elit. Vel enim enim velit aliquam orci non posuere. Lectus consequat.';
    document.getElementById('likes').value = '56';
    document.getElementById('duration').value = '12';
    document.getElementById('duration-unit').value = 'h';

    // Eventos para los botones de redes sociales
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedSocial = button.dataset.social;
            socialButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updatePreview();
        });
    });

    // Eventos para los campos del formulario
    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);

    // Evento para el botón de descarga
    downloadBtn.addEventListener('click', downloadImage);

    // Evento para mostrar el nombre del archivo seleccionado
    document.getElementById('profile-pic').addEventListener('change', function (e) {
        const fileName = e.target.files[0]?.name;
        const fileNameElement = document.querySelector('.file-name');
        if (fileName) {
            fileNameElement.textContent = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
        } else {
            fileNameElement.textContent = '';
        }
    });

    function updatePreview() {
        if (!selectedSocial) return;

        const username = document.getElementById('username').value;
        const profilePic = document.getElementById('profile-pic');
        const content = document.getElementById('content').value;
        const likes = document.getElementById('likes').value;
        const duration = document.getElementById('duration').value;
        const durationUnit = document.getElementById('duration-unit').value;

        let profilePicUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
        if (profilePic.files && profilePic.files[0]) {
            profilePicUrl = URL.createObjectURL(profilePic.files[0]);
        }

        let formattedDuration = '';
        if (duration) {
            formattedDuration = durationUnit === 'h' ? `${duration}h` : `${duration}d`;
        }

        // Formatear el nombre de usuario
        const formattedUsername = formatUsername(username);

        // Formatear el contenido del comentario
        const formattedContent = formatContent(content);

        preview.innerHTML = `
            <div class="instagram-comment">
                <img src="${profilePicUrl}" alt="Profile Picture" class="profile-pic">
                <div class="comment-content">
                    <div class="username-time">
                        <span class="username">${formattedUsername}</span>
                        <span class="time">${formattedDuration}</span>
                    </div>
                    <p class="comment-text">${formattedContent}</p>
                    <div class="comment-actions">
                        <span class="action">Reply</span>
                        <span class="action">See translation</span>
                    </div>
                </div>
                <div class="likes-section">
                    <svg class="heart-icon" fill=red role="img" viewBox="0 0 48 48"><title>Liked</title><path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path></svg>
                    <p class="likes-count">${likes}</p>

                </div>
            </div>
        `;
    }

    function downloadImage() {
        const element = document.getElementById('capture-area');

        // Calcula el tamaño exacto del contenido
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

function formatUsername(username) {
    return username.toLowerCase().replace(/[^a-z0-9._]/g, '');
}

function formatContent(content) {
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
        .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
}