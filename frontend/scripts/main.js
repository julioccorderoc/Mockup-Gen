import {
    initializeUpdates,
    initializeSocialMediaEvents,
    initializeOptionButtonEvents,
    initializeDownloadEvent
} from './utils/eventListeners.js';
import { loadPlaceholderTemplate } from './utils/updatePreview.js';

document.addEventListener('DOMContentLoaded', () => {

    // init model
    loadPlaceholderTemplate();

    // init events
    initializeUpdates();
    initializeSocialMediaEvents();
    initializeOptionButtonEvents();
    initializeDownloadEvent();

});