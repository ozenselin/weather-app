import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createState = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    let isInitialized = false;
    let currentDayIndex = null;
    let previousDayIndex = null;

    const getCurrentDayIndex = () => currentDayIndex;
    const getPreviousDayIndex = () => previousDayIndex;
    const setCurrentDayIndex = (newIndex) => {
        if(!newIndex && newIndex != 0) {
            return;
        }
        previousDayIndex = currentDayIndex;
        currentDayIndex = newIndex;
    }

    const initialize = () => {
        if (isInitialized) return;

        currentDayIndex = 0;
        previousDayIndex = 0;

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        currentDayIndex = null;
        previousDayIndex = null;
    };

    return {
        // core functionality
        initialize,
        destroy,
        getCurrentDayIndex,
        getPreviousDayIndex,
        setCurrentDayIndex,
        get isInitialized() {
            return isInitialized;
        }
    };
};

// state.getCurrentDayIndex()
// state.getPreviousDayIndex()
// state.getCurrentForecast();