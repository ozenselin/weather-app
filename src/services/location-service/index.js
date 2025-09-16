import { createState } from "./state.js";
import { createEvents } from "./events.js";
import { createAPI } from "./api.js";

export const createLocationService = () => {
    let state = null;
    let events = null;
    let api = null;
    let isInitialized = false;

    const initialize = () => {
        if (isInitialized) return;

        // Create modules
        state = createState();
        api = createAPI();
        events = createEvents(state);

        // Initialize in correct order
        state.initialize();
        api.initialize();
        events.initialize();

        const location = state.getCurrentLocation();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        // Destroy in reverse order
        if (events?.destroy) events.destroy();
        if (api?.destroy) api.destroy();
        if (state?.destroy) state.destroy();

        events = null;
        api = null;
        state = null;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        get isInitialized() {
            return isInitialized;
        }
    };
};