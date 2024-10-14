import { inititalizeUpdates, initializeSocialMediaEvents, initializeOptionButtonEvents } from './eventListeners.js'
import { setPlaceholdersValues, loadPlaceholderTemplate } from './eventListeners.js'
import { createModel, currentModel } from './dataModel.js'

document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = document.querySelectorAll('.social-button');
    const optionButtons = document.querySelectorAll('.option-button');

    // init model
    Object.assign(currentModel, createModel());
    setPlaceholdersValues();
    loadPlaceholderTemplate();

    // init events
    inititalizeUpdates();
    initializeSocialMediaEvents();
    initializeOptionButtonEvents();

});