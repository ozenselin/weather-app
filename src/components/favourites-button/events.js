import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createEvents = (dom) => {
    if (!dom || !eventBus || !config) {
        throw new Error("dom, event bus, and config are required");
    }

    let eventManager = null;
    let isInitialized = false;
    let elements = null;

    const handleAddButtonClick = () => {
        eventBus.emit("location:add-current-to-favourites-requested");
    }

    const setupEventListeners = () => {
        const addButton = elements.addButton;
        eventManager.addEventListener(addButton, "click", handleAddButtonClick);
    };

    const removeEventListeners = () => {
        
    };

    const initialize = () => {
        if (isInitialized) return;

        elements = dom.getElements();
        eventManager = createEventManager();
        setupEventListeners();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        removeEventListeners();
        if(eventManager?.destroy) eventManager.destroy();

        eventManager = null;
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