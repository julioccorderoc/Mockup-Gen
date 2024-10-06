document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = document.querySelectorAll('.social-button');
    const optionButtons = document.querySelectorAll('.option-button');
    //const model = createModel();
    //const preview = document.getElementById('preview');

    // set template selector variables
    let selectedSocial = null;
    let selectedOption = null;

    // placeholder values
    setPlaceholdersValues()

    // Cargar inicialmente la plantilla placeholder
    loadPlaceholderTemplate();

    // Eventos para los campos del formulario
    document.querySelectorAll('.input-fields input, .input-fields textarea, .input-fields select').forEach(element => {
        element.addEventListener('input', updatePreview);
        element.addEventListener('change', updatePreview);
    });

    // Evento para seleccionar la red social
    socialButtons.forEach(button => {
        button.addEventListener('click', function () {
            const social = this.getAttribute('data-social');

            // Si la red social ya está seleccionada, ocultamos las opciones y reiniciamos
            if (selectedSocial === social) {
                resetOptionSelector();
                selectedSocial = null;
                loadPlaceholderTemplate(); // Cargar la plantilla placeholder
            } else {
                selectedSocial = social;
                console.log("Red social seleccionada:", selectedSocial);

                resetOptionSelector();
                document.getElementById('option-selector').style.display = 'block'; // Mostrar el selector de opciones
            }
        });
    });

    // Evento para seleccionar la opción
    optionButtons.forEach(button => {
        button.addEventListener('click', function () {
            selectedOption = this.getAttribute('data-option');
            console.log("Opción seleccionada:", selectedOption);

            // Remover la clase seleccionada de otros botones
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');

            // Verificar que ambas selecciones estén hechas
            if (selectedSocial && selectedOption) {
                loadTemplate(selectedSocial, selectedOption); // Cargar la plantilla
            }
        });
    });

});

// set placeholder values
function setPlaceholdersValues() {
    document.getElementById('username').value = 'username';
    document.getElementById('content').value = 'Lorem @ipsum odor amet, adipiscing #elit. Vel enim enim velit aliquam orci non posuere. Lectus consequat.';
    document.getElementById('likes').value = '56';
    document.getElementById('duration').value = '12';
    document.getElementById.value = 'h';
}

// Función para cargar la plantilla placeholder si no hay selección
async function loadPlaceholderTemplate() {
    try {
        const response = await fetch(`../templates/placeholder.html`);
        const template = await response.text();
        const captureArea = document.getElementById('capture-area');

        if (captureArea) {
            captureArea.innerHTML = template;
        } else {
            console.error('El contenedor de la vista previa no existe');
        }
    } catch (error) {
        console.error('Error al cargar la plantilla placeholder:', error);
        loadErrorTemplate();
    }
}

// Función para cargar la plantilla de error
async function loadErrorTemplate() {
    try {
        const response = await fetch(`../templates/load-error.html`);
        const template = await response.text();
        const captureArea = document.getElementById('capture-area');

        if (captureArea) {
            captureArea.innerHTML = template;
        } else {
            console.error('El contenedor de la vista previa no existe');
        }
    } catch (error) {
        console.error('Error al cargar la plantilla de error:', error);
    }
}

// Función para restablecer el selector de opciones
function resetOptionSelector() {
    selectedOption = null;
    document.querySelectorAll('.option-button').forEach(button => {
        button.classList.remove('selected'); // Remueve cualquier selección previa
    });
    document.getElementById('option-selector').style.display = 'none'; // Ocultar las opciones
}

// model to capture data
function createModel() {
    const username = document.getElementById('username').value;
    const profilePic = document.getElementById('profile-pic');
    const content = document.getElementById('content').value;
    const likes = document.getElementById('likes').value;
    const duration = document.getElementById('duration').value;
    const durationUnit = document.getElementById('duration-unit').value;

    let profilePicUrl = 'static/placeholders/profile-pic.svg';
    if (profilePic.files && profilePic.files[0]) {
        profilePicUrl = URL.createObjectURL(profilePic.files[0]);
    }

    let formattedDuration = '';
    if (duration) {
        formattedDuration = durationUnit === 'h' ? `${duration}h` : `${duration}d`;
    }

    return {
        username: formatUsername(username),
        profilePicUrl: profilePicUrl,
        formattedContent: formatContent(content),
        likes: likes,
        formattedDuration: formattedDuration
    };
}

// update template values
function insertValuesIntoTemplate(template, model) {
    try {
        Object.keys(model).forEach(key => {
            const regex = new RegExp(`\\[${key}\\]`, 'g');
            if (template.match(regex)) {
                template = template.replace(regex, model[key] || '');
            } else if (model[key]) {
                console.log(`La plantilla no tiene campo para: ${key}`);
            }
            if (!model[key]) {
                console.log(`Falta ${key} para completar el modelo`);
            }
        });
        return template;
    } catch (error) {
        console.error('Error insertando los valores en la plantilla:', error);
        return template;
    }
}

// template loader function
async function loadTemplate(social, option) {
    const templatePath = `../templates/${social}/${social}-${option}.html`;
    try {
        const response = await fetch(templatePath);
        if (!response.ok) {
            console.warn(`Plantilla no encontrada en ${templatePath}. Cargando la plantilla de error.`);
            throw new Error('Plantilla no encontrada');
        }
        const template = await response.text();
        const model = createModel();
        const renderedTemplate = insertValuesIntoTemplate(template, model);
        document.getElementById('capture-area').innerHTML = renderedTemplate;
    } catch (error) {
        console.error('Error al cargar la plantilla:', error);
        loadErrorTemplate();
    }
}

// Función para actualizar un input específico en la plantilla
function updateInputOnTemplate(template, key, value) {
    try {
        const regex = new RegExp(`\\[${key}\\]`, 'g');
        if (template.match(regex)) {
            return template.replace(regex, value);
        } else {
            console.log(`La plantilla no tiene campo para: ${key}`);
            return template;
        }
    } catch (error) {
        console.error(`Error actualizando ${key} en la plantilla:`, error);
        return template;
    }
}

// Update preview function
function updatePreview(event) {
    if (!selectedSocial || !selectedOption) {
        console.log('No se ha seleccionado una red social o una opción');
        return;
    }

    try {
        const captureArea = document.getElementById('capture-area');
        if (!captureArea) {
            throw new Error('El contenedor de captura no existe');
        }

        const changedInput = event.target;
        const inputKey = changedInput.id;
        let inputValue = changedInput.value;

        if (inputKey === 'username') {
            inputValue = formatUsername(inputValue);
        } else if (inputKey === 'content') {
            inputValue = formatContent(inputValue);
        } else if (inputKey === 'duration' || inputKey === 'duration-unit') {
            const duration = document.getElementById('duration').value;
            const durationUnit = document.getElementById('duration-unit').value;
            inputValue = durationUnit === 'h' ? `${duration}h` : `${duration}d`;
            inputKey = 'formattedDuration';
        }

        let updatedTemplate = captureArea.innerHTML;
        updatedTemplate = updateInputOnTemplate(updatedTemplate, inputKey, inputValue);
        captureArea.innerHTML = updatedTemplate;

        console.log('Vista previa actualizada con éxito');
    } catch (error) {
        console.error('Error al actualizar la vista previa:', error);
    }
}

// Formating functions
function formatUsername(username) {
    return username.toLowerCase().replace(/[^a-z0-9._]/g, '');
}

function formatContent(content) {
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
        .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
}