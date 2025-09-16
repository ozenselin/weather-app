import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createDOM = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    let elements = null;
    let isInitialized = false;

    const cacheElements = () => {
        elements = {
            addButton: document.querySelector(".header__controls__btn--add"),
        };
    };

    const getElements = () => {
        if (!elements) {
            cacheElements();
        }
        return elements;
    };

    const initialize = () => {
        if (isInitialized) return;
        cacheElements();
        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        elements = null;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        getElements,
        get isInitialized() {
            return isInitialized;
        }
    };
};