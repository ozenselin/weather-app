// services/weatherService/index.js
import { createState } from "./state.js";
import { createEvents } from "./events.js";
import { createAPI } from "./api.js";

export const createWeatherService = () => {
    let isInitialized = false;
    let state = null;
    let events = null;
    let api = null;

    const initialize = () => {
        if (isInitialized) return;

        state = createState();
        events = createEvents(state);
        api = createAPI();

        state.initialize();
        events.initialize();
        api.initialize();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        if (state?.destroy) state.destroy();
        if (events?.destroy) events.destroy();
        if (api?.destroy) api.destroy();

        state = null;
        events = null;
        api = null;
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

export const weatherService = createWeatherService();
