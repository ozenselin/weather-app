import { createState } from "./state.js";
import { createEvents } from "./events.js";
import { createConverter } from "./converter.js";

export const createUnitService = () => {
    let isInitialized = false;
    let state = null;
    let events = null;
    let converter = null;

    const initialize = () => {
        if (isInitialized) return;

        state = createState();
        converter = createConverter();
        events = createEvents(state, converter);

        state.initialize();
        events.initialize();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        if (events?.destroy) events.destroy();
        if (state?.destroy) state.destroy();

        state = null;
        events = null;
        converter = null;
        isInitialized = false;
    };

    // Public API
    const convertTemperature = (value, fromUnit = null, toUnit = null) => {
        const from = fromUnit || 'celsius';
        const to = toUnit || state.getTemperatureUnit();
        return converter.convertTemperature(value, from, to);
    };

    const convertSpeed = (value, fromUnit = null, toUnit = null) => {
        const from = fromUnit || 'kmh';
        const to = toUnit || state.getSpeedUnit();
        return converter.convertSpeed(value, from, to);
    };

    const formatTemperature = (value, decimals = 0) => {
        const unit = state.getTemperatureUnit();
        return converter.formatTemperature(value, unit, decimals);
    };

    const formatSpeed = (value, decimals = 0) => {
        const unit = state.getSpeedUnit();
        return converter.formatSpeed(value, unit, decimals);
    };

    const getCurrentUnits = () => ({
        temperature: state.getTemperatureUnit(),
        speed: state.getSpeedUnit(),
        isImperial: state.getIsImperial()
    });

    return {
        initialize,
        destroy,
        convertTemperature,
        convertSpeed,
        formatTemperature,
        formatSpeed,
        getCurrentUnits,
        get isInitialized() {
            return isInitialized;
        }
    };
};