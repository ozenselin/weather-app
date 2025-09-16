import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createDOM = (state) => {
    if (!config || !state || !eventBus) {
        throw new Error("config, state and event bus are required");
    }

    let elements = null;
    let isInitialized = false;

    const cacheElements = () => {
        elements = {
            toggle: document.querySelector(".header__controls__temp-toggle"),
            buttons: Array.from(document.querySelectorAll(".header__controls__temp-toggle__btn")),
            fahrenheitButton: document.querySelector(".header__controls__temp-toggle__btn--fahrenheit"),
            celciusButton: document.querySelector(".header__controls__temp-toggle__btn--celcius"),
        };
    };

    const updateClasses = () => {
        const unit = state.getCurrentUnit();
        if(unit == "celcius") {
            elements.celciusButton.classList.add("header__controls__temp-toggle__btn--active", "glass-background");
            elements.fahrenheitButton.classList.remove("header__controls__temp-toggle__btn--active", "glass-background");
        } else if (unit == "fahrenheit"){ 
            elements.celciusButton.classList.remove("header__controls__temp-toggle__btn--active", "glass-background");
            elements.fahrenheitButton.classList.add("header__controls__temp-toggle__btn--active", "glass-background");
        }
    }

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
        updateClasses,
        get isInitialized() {
            return isInitialized;
        }
    };
};