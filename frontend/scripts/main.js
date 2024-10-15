import { loadPlaceholderTemplate, inititalizeUpdates, initializeSocialMediaEvents, initializeOptionButtonEvents } from './utils/eventListeners.js'
import { setPlaceholdersValues } from './utils/eventListeners.js'
import { createModel, currentModel } from './utils/dataModel.js'

document.addEventListener('DOMContentLoaded', () => {

    // init model
    Object.assign(currentModel, createModel()); // will be part of the load template
    setPlaceholdersValues(); // will be part of the load template
    loadPlaceholderTemplate(); // will remain

    // init events
    inititalizeUpdates();
    initializeSocialMediaEvents();
    initializeOptionButtonEvents();

});