document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = document.querySelectorAll('.social-button');
    const preview = document.getElementById('preview');

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
    document.querySelectorAll('.input-fields input, .input-fields textarea, .input-fields select').forEach(element => {
        element.addEventListener('input', updatePreview);
        element.addEventListener('change', updatePreview);
    });

    function updatePreview() {
        if (!selectedSocial) return;

        const username = document.getElementById('username').value;
        const profilePic = document.getElementById('profile-pic');
        const content = document.getElementById('content').value;
        const likes = document.getElementById('likes').value;
        const duration = document.getElementById('duration').value;
        const durationUnit = document.getElementById('duration-unit').value;

        let profilePicUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
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

        document.getElementById('capture-area').innerHTML = `
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

});

function formatUsername(username) {
    return username.toLowerCase().replace(/[^a-z0-9._]/g, '');
}

function formatContent(content) {
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
        .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
}