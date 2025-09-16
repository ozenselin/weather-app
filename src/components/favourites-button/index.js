import { createEvents } from "./events.js";
import { createDOM } from "./dom.js";

export const createFavouritesButton = () => {
    let isInitialized = false;
    let dom = null;
    let events = null;

    const initialize = () => {
        if (isInitialized) return;

        dom = createDOM();
        events = createEvents(dom);

        dom.initialize();
        events.initialize();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        if (events?.destroy) events.destroy();
        if (dom?.destroy) dom.destroy();

        dom = null;
        events = null;
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