import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createEvents = (dom) => {
    if (!config || !eventBus) {
        throw new Error("event bus and config are required");
    }

    let elements = null;
    let eventManager = null
    let isInitialized = false;

    //event handlers
    const handleWeatherStateChange = (state) => {
        dom.displayTheShowcase(state);
    }

    const setupEventListeners = () => {
        //add event handlers for event bus (custom events)
        eventBus.on("weather:state-changed", handleWeatherStateChange);
        // eventBus.on("weather:current-hour-changed", handleHourChange);
    }
    
    const initialize = () => {
        if(isInitialized) return;

        elements = dom.getElements();
        eventManager = createEventManager();
        setupEventListeners();

        isInitialized = true;
    }

    const destroy = () => {
        if(!isInitialized) console.log("Must call initialize() first");
        eventManager.removeEventListeners();
        eventManager = null;
        api = null;
        elements = null;
        isInitialized = false;
    }

    return {
        initialize,
        destroy,
        get isInitialized() {
            return isInitialized;
        },
    }
}