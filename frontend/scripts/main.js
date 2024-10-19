import {
    loadPlaceholderTemplate,
    initializeUpdates,
    initializeSocialMediaEvents,
    initializeOptionButtonEvents,
    initializeDownloadEvent
} from './utils/eventListeners.js';

document.addEventListener('DOMContentLoaded', () => {

    // init model
    loadPlaceholderTemplate(); // will remain

    // init events
    initializeUpdates();
    initializeSocialMediaEvents();
    initializeOptionButtonEvents();
    initializeDownloadEvent();

});