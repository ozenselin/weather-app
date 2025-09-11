import {createDOM} from "./dom.js";
import {createEvents} from "./events.js";

export const createShowcase = () => {
    let isInitialized = false;
    let dom = null;
    let events = null;

    const initialize = () => {
        if(isInitialized) return;

        dom = createDOM();
        events = createEvents(dom);

        dom.initialize();
        events.initialize();

        isInitialized = true;
    }

    const destroy = () => {
        if(!isInitialized) console.log("Must call initialize() first!");

        if(dom?.destroy()) dom.destroy();
        if(events?.destroy()) events.destroy();

        dom = null;
        events = null;

        isInitialized = false;
    }

    return {
        initialize,
        destroy,
        get isInitialized() {
            return isInitialized;
        }
    }
}