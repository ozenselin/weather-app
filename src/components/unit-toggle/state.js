import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createState = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    let isInitialized = false;
    let currentUnit = null; //celcius, fahrenheit


    const getCurrentUnit = () => {
        if (!currentUnit) return;
        return currentUnit;
    };

    const setCurrentUnit = (newUnit) => {
        if(!newUnit) return;

        const sanitizedUnit = newUnit.trim().toLowerCase();
        if(sanitizedUnit != "celcius" && sanitizedUnit != "fahrenheit") return;

        currentUnit = sanitizedUnit;
    }

    const initialize = () => {
        if (isInitialized) return;
        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        isInitialized = false;
    };

    return {
        // core functionality
        initialize,
        destroy,
        //unit
        getCurrentUnit,
        setCurrentUnit,
        get isInitialized() {
            return isInitialized;
        }
    };
};