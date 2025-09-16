import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createEvents = (state, dom) => {
    if (!state || !dom || !eventBus || !config) {
        throw new Error("state, dom, event bus, and config are required");
    }

    let eventManager = null;
    let isInitialized = false;
    let elements = null;

    const handleToggleClick = (event) => {
        const button = event.target.closest("button");

        const currentUnit = state.getCurrentUnit();

        const unit = button.textContent?.at(1) == "C" ? "celcius" : "fahrenheit" //°C, °F

        if(currentUnit == unit) return;

        state.setCurrentUnit(unit);

        dom.updateClasses();

        eventBus.emit("unit:toggle-temperature-requested");
        eventBus.emit("unit:toggle-speed-requested");
    }

    const setupEventListeners = () => {
        const toggle = elements.toggle;
        eventManager.addEventListener(toggle, "click", handleToggleClick);
    };

    const removeEventListeners = () => {

    };

    const initialize = () => {
        if (isInitialized) return;
        eventBus.emit("unit:temperature-unit-requested", (unit) => {
            state.setCurrentUnit(unit);
            dom.updateClasses();
        });

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
        if (eventManager?.destroy) {
            eventManager.destroy();
        }
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