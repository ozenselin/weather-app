import { createState } from "./state.js";
import { createEvents } from "./events.js";
import { createDOM } from "./dom.js";

export const createUnitToggle = () => {
    let isInitialized = false;
    let state = null;
    let dom = null;
    let events = null;

    const initialize = () => {
        if (isInitialized) return;

        state = createState();
        dom = createDOM(state);
        events = createEvents(state, dom);

        state.initialize();
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
        if (state?.destroy) state.destroy();

        state = null;
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