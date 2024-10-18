import { loadPlaceholderTemplate } from './utils/eventListeners.js'
import { initializeUpdates, initializeSocialMediaEvents, initializeOptionButtonEvents } from './utils/eventListeners.js'
//import { createModel, currentModel } from './utils/dataModel.js'

document.addEventListener('DOMContentLoaded', () => {

    // init model
    loadPlaceholderTemplate(); // will remain

    // init events
    initializeUpdates();
    initializeSocialMediaEvents();
    initializeOptionButtonEvents();

});